import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InvoiceGenerator from '../components/InvoiceGenerator';
// import { useToast } from '../components/Toast';
import './AdminOrders.css';

function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  
  const ordersPerPage = 10;
  const { downloadInvoice, previewInvoice } = InvoiceGenerator();
  // const { ToastComponent, showSuccess, showError, showInfo } = useToast();

  // Professional notification system
  const [notification, setNotification] = useState(null);
  
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  const showSuccess = (message) => showNotification(message, 'success');
  const showError = (message) => showNotification(message, 'error');
  const showInfo = (message) => showNotification(message, 'info');
  
  const NotificationComponent = () => {
    if (!notification) return null;
    
    return (
      <div className={`notification ${notification.type}`}>
        <span>{notification.message}</span>
        <button onClick={() => setNotification(null)} className="notification-close">×</button>
      </div>
    );
  };

  // Order status configurations
  const statusConfig = {
    PENDING: { color: '#ffc107', bg: '#fff3cd', label: 'Pending' },
    CONFIRMED: { color: '#17a2b8', bg: '#d1ecf1', label: 'Confirmed' },
    PROCESSING: { color: '#fd7e14', bg: '#ffe8d4', label: 'Processing' },
    SHIPPED: { color: '#6f42c1', bg: '#e2d9f3', label: 'Shipped' },
    DELIVERED: { color: '#28a745', bg: '#d4edda', label: 'Delivered' },
    CANCELLED: { color: '#dc3545', bg: '#f8d7da', label: 'Cancelled' },
    REFUNDED: { color: '#6c757d', bg: '#e9ecef', label: 'Refunded' }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/orders');
      console.log('Admin Orders API response:', response.data);
      
      if (Array.isArray(response.data)) {
        setOrders(response.data);
        // Only show success notification if it's a manual refresh
        if (orders.length > 0) {
          showSuccess(`Orders refreshed successfully (${response.data.length} orders)`);
        }
      } else {
        console.warn('Orders API returned non-array data:', response.data);
        setOrders([]);
        showError('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      showError('Failed to load orders. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:8080/api/orders/${orderId}/status`, { status: newStatus });
      await fetchOrders();
      showSuccess(`Order #${orderId} status updated to ${newStatus.toLowerCase()}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Failed to update order status. Please try again.');
    }
  };

  // Filter and search logic
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filter === 'ALL' || order.status === filter;
    const matchesSearch = !searchTerm || 
      order.id.toString().includes(searchTerm) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const orderDate = new Date(order.orderDate);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDate = orderDate >= startDate && orderDate <= endDate;
    }
    
    return matchesStatus && matchesSearch && matchesDate;
  });

  // Sorting logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'orderDate') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

  // Order statistics
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    processing: orders.filter(o => o.status === 'PROCESSING').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    revenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
  };

  // Bulk operations
  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;
    
    try {
      const statusUpdates = [];
      for (const orderId of selectedOrders) {
        if (bulkAction.startsWith('status-')) {
          const status = bulkAction.replace('status-', '');
          statusUpdates.push(updateOrderStatus(orderId, status));
        }
      }
      await Promise.all(statusUpdates);
      setSelectedOrders([]);
      setBulkAction('');
      showSuccess(`Bulk action completed for ${selectedOrders.length} orders`);
    } catch (error) {
      showError('Some bulk actions failed. Please check individual orders.');
    }
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === currentOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentOrders.map(order => order.id));
    }
  };



  const handleDownloadInvoice = (order) => {
    try {
      downloadInvoice(order);
      showSuccess(`Invoice for Order #${order.id} download started`);
    } catch (error) {
      showError('Failed to download invoice. Please try again.');
    }
  };

  const handlePreviewInvoice = (order) => {
    try {
      previewInvoice(order);
    } catch (error) {
      showError('Failed to preview invoice. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-orders-container">
        <NotificationComponent />
        <div className="loading-spinner">
          <div className="loading-content">
            <div className="loading-animation"></div>
            <div className="loading-text">
              <h2 className="loading-title">Loading Orders</h2>
              <p className="loading-subtitle">Fetching order data from server...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders-container">
      <NotificationComponent />
      
      {/* Header */}
      <div className="orders-header">
        <div className="header-left">
          <button 
            onClick={() => navigate('/admin-dashboard')} 
            className="back-btn"
          >
            ← Back to Dashboard
          </button>
          <div className="header-title">
            <h1>Order Management</h1>
            <p>Manage and track all customer orders</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={fetchOrders} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="order-stats">
        <div className="stat-card">
          <div className="stat-content">
            <h3>{orderStats.total}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-content">
            <h3>{orderStats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card processing">
          <div className="stat-content">
            <h3>{orderStats.processing}</h3>
            <p>Processing</p>
          </div>
        </div>
        <div className="stat-card shipped">
          <div className="stat-content">
            <h3>{orderStats.shipped}</h3>
            <p>Shipped</p>
          </div>
        </div>
        <div className="stat-card delivered">
          <div className="stat-content">
            <h3>{orderStats.delivered}</h3>
            <p>Delivered</p>
          </div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-content">
            <h3>₹{orderStats.revenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="orders-controls">
        <div className="controls-left">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by Order ID or Customer Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
        <div className="controls-right">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="date-input"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="date-input"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-info">
            <span>{selectedOrders.length} orders selected</span>
          </div>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="bulk-select"
          >
            <option value="">Select Action</option>
            <option value="status-CONFIRMED">Mark as Confirmed</option>
            <option value="status-PROCESSING">Mark as Processing</option>
            <option value="status-SHIPPED">Mark as Shipped</option>
            <option value="status-DELIVERED">Mark as Delivered</option>
            <option value="status-CANCELLED">Mark as Cancelled</option>
          </select>
          <button onClick={handleBulkAction} className="bulk-apply-btn">
            Apply
          </button>
          <button onClick={() => setSelectedOrders([])} className="bulk-clear-btn">
            Clear Selection
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedOrders.length === currentOrders.length && currentOrders.length > 0}
                  onChange={selectAllOrders}
                />
              </th>
              <th onClick={() => { setSortBy('id'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                Order ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => { setSortBy('orderDate'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                Date {sortBy === 'orderDate' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Customer</th>
              <th>Items</th>
              <th onClick={() => { setSortBy('totalAmount'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                Total {sortBy === 'totalAmount' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map(order => (
              <tr key={order.id} className={selectedOrders.includes(order.id) ? 'selected' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => toggleOrderSelection(order.id)}
                  />
                </td>
                <td className="order-id">#{order.id}</td>
                <td>{formatDate(order.orderDate)}</td>
                <td>
                  <div className="customer-info">
                    <div className="customer-email">{order.customerEmail}</div>
                    <div className="customer-phone">{order.customerPhone}</div>
                  </div>
                </td>
                <td>
                  <span className="item-count">
                    {order.orderItems?.length || 0} items
                  </span>
                </td>
                <td className="order-total">₹{order.totalAmount?.toFixed(2)}</td>
                <td>
                  <span 
                    className="status-badge" 
                    style={{ 
                      backgroundColor: statusConfig[order.status]?.bg,
                      color: statusConfig[order.status]?.color 
                    }}
                  >
                    {statusConfig[order.status]?.label || order.status}
                  </span>
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <div className="status-dropdown">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="REFUNDED">Refunded</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => handleDownloadInvoice(order)} 
                      className="action-btn invoice-btn"
                      title="Download Invoice"
                    >
                      Invoice
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {currentOrders.length === 0 && (
          <div className="no-orders">
            <h3>No orders found</h3>
            <p>No orders match your current filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <div className="pagination-info">
            Page {currentPage} of {totalPages} ({sortedOrders.length} orders)
          </div>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setShowOrderDetail(false)}
          onStatusUpdate={updateOrderStatus}
          onDownloadInvoice={handleDownloadInvoice}
        />
      )}
    </div>
  );
}

// Order Detail Modal Component
const OrderDetailModal = ({ order, onClose, onStatusUpdate, onDownloadInvoice }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="order-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Order Details - #{order.id}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="order-summary">
            <div className="summary-section">
              <h3>Order Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Order Date:</label>
                  <span>{formatDate(order.orderDate)}</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span className="status-badge">{order.status}</span>
                </div>
                <div className="info-item">
                  <label>Total Amount:</label>
                  <span className="amount">₹{order.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="summary-section">
              <h3>Customer Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Email:</label>
                  <span>{order.customerEmail}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{order.customerPhone}</span>
                </div>
                <div className="info-item">
                  <label>Address:</label>
                  <span>{order.shippingAddress}</span>
                </div>
              </div>
            </div>

            <div className="summary-section">
              <h3>Order Items</h3>
              <div className="order-items-list">
                {order.orderItems?.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-info">
                      <span className="item-name">{item.productName}</span>
                      <span className="item-details">
                        Qty: {item.quantity} × ₹{item.unitPrice?.toFixed(2)}
                      </span>
                    </div>
                    <div className="item-total">
                      ₹{(item.quantity * item.unitPrice)?.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <select
              value={order.status}
              onChange={(e) => onStatusUpdate(order.id, e.target.value)}
              className="status-select-modal"
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <button 
              onClick={() => onDownloadInvoice(order)} 
              className="invoice-download-btn"
            >
              Download Invoice
            </button>
            <button onClick={onClose} className="close-btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
