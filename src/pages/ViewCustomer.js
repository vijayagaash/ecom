import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CustomerManagement.css';

function ViewCustomer() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState('cust_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  
  const customersPerPage = 12;

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

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      
      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      const response = await axios.get("http://localhost:8080/api/customers");
      
      // Complete the progress bar
      setLoadingProgress(100);
      
      setCustomers(response.data);
      
      // Only show success notification if it's a manual refresh
      if (customers.length > 0) {
        showSuccess(`Customers refreshed successfully (${response.data.length} customers)`);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      showError('Failed to load customers. Please check your connection.');
    } finally {
      // Small delay to show completed progress before hiding
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 300);
    }
  };

  const handleDelete = async (id, customerName) => {
    if (window.confirm(`Are you sure you want to delete customer "${customerName}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`http://localhost:8080/api/customers/${id}`);
        await fetchCustomers();
        showSuccess(`Customer "${customerName}" has been deleted successfully`);
      } catch (error) {
        console.error('Error deleting customer:', error);
        showError('Failed to delete customer. Please try again.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedCustomers.length} selected customers? This action cannot be undone.`)) {
      try {
        const deletePromises = selectedCustomers.map(id => 
          axios.delete(`http://localhost:8080/api/customers/${id}`)
        );
        await Promise.all(deletePromises);
        await fetchCustomers();
        setSelectedCustomers([]);
        showSuccess(`${selectedCustomers.length} customers deleted successfully`);
      } catch (error) {
        showError('Some customers could not be deleted. Please try again.');
      }
    }
  };

  const toggleCustomerSelection = (customerId) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const selectAllCustomers = () => {
    if (selectedCustomers.length === currentCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(currentCustomers.map(customer => customer.id));
    }
  };

  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetail(true);
  };

  // Filter and search logic
  const filteredCustomers = customers.filter(customer =>
    customer.cust_name?.toLowerCase().includes(search.toLowerCase()) ||
    customer.cust_email?.toLowerCase().includes(search.toLowerCase()) ||
    customer.id?.toString().includes(search)
  );

  // Sorting logic
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Pagination logic
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = sortedCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(sortedCustomers.length / customersPerPage);

  // Customer statistics
  const customerStats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active' || !c.status).length,
    new: customers.filter(c => {
      if (!c.created_at) return false;
      const createdDate = new Date(c.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate > thirtyDaysAgo;
    }).length
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loading) {
    return (
      <div className="customer-management-container">
        <NotificationComponent />
        <div className="loading-spinner">
          <div className="loading-content">
            <div className="loading-animation"></div>
            <div className="loading-text">
              <h2 className="loading-title">Loading Customers</h2>
              <p className="loading-subtitle">Fetching customer data from server...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-management-container">
      <NotificationComponent />
      
      {/* Header */}
      <div className="customers-header">
        <div className="header-left">
          <button 
            onClick={() => navigate('/admin-dashboard')} 
            className="back-btn"
          >
            ← Back to Dashboard
          </button>
          <div className="header-title">
            <h1>Customer Management</h1>
            <p>Manage and view all registered customers</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={fetchCustomers} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="customer-stats">
        <div className="stat-card">
          <div className="stat-content">
            <h3>{customerStats.total}</h3>
            <p>Total Customers</p>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-content">
            <h3>{customerStats.active}</h3>
            <p>Active Customers</p>
          </div>
        </div>
        <div className="stat-card new">
          <div className="stat-content">
            <h3>{customerStats.new}</h3>
            <p>New This Month</p>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="customers-controls">
        <div className="controls-left">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="sort-select"
          >
            <option value="cust_name-asc">Name A-Z</option>
            <option value="cust_name-desc">Name Z-A</option>
            <option value="cust_email-asc">Email A-Z</option>
            <option value="cust_email-desc">Email Z-A</option>
            <option value="id-asc">ID (Low to High)</option>
            <option value="id-desc">ID (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCustomers.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-info">
            <span>{selectedCustomers.length} customers selected</span>
          </div>
          <button onClick={handleBulkDelete} className="bulk-delete-btn">
            Delete Selected
          </button>
          <button onClick={() => setSelectedCustomers([])} className="bulk-clear-btn">
            Clear Selection
          </button>
        </div>
      )}

      {/* Custom Customers List */}
      <div className="customers-list-container">
        {/* List Header */}
        <div className="list-header">
          <div className="header-checkbox">
            <input
              type="checkbox"
              checked={selectedCustomers.length === currentCustomers.length && currentCustomers.length > 0}
              onChange={selectAllCustomers}
            />
          </div>
          <div className="header-info">Customer Information</div>
          <div className="header-contact">Contact Details</div>
          <div className="header-joined">Member Since</div>
          <div className="header-actions">Actions</div>
        </div>

        {/* Customer Items */}
        <div className="customers-list">
          {currentCustomers.map(customer => (
            <div 
              key={customer.id} 
              className={`customer-item ${selectedCustomers.includes(customer.id) ? 'selected' : ''}`}
            >
              {/* Selection Checkbox */}
              <div className="item-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCustomers.includes(customer.id)}
                  onChange={() => toggleCustomerSelection(customer.id)}
                />
              </div>

              {/* Customer Info Section */}
              <div className="item-info">
                <div className="customer-profile">
                  <div className="profile-avatar">
                    {getInitials(customer.cust_name)}
                  </div>
                  <div className="profile-details">
                    <h3 className="customer-name">{customer.cust_name || 'Unknown Customer'}</h3>
                    <span className="customer-id">ID: #{customer.id}</span>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="item-contact">
                <div className="contact-email">
                  <span className="contact-label">Email</span>
                  <span className="contact-value">{customer.cust_email || 'No email provided'}</span>
                </div>
                <div className="contact-phone">
                  <span className="contact-label">Phone</span>
                  <span className="contact-value">{customer.cust_phone || 'No phone provided'}</span>
                </div>
                {customer.cust_address && (
                  <div className="contact-address">
                    <span className="contact-label">Address</span>
                    <span className="contact-value">{customer.cust_address}</span>
                  </div>
                )}
              </div>

              {/* Joined Date */}
              <div className="item-joined">
                <span className="joined-label">Joined</span>
                <span className="joined-date">{formatDate(customer.created_at)}</span>
              </div>

              {/* Actions */}
              <div className="item-actions">
                <button 
                  onClick={() => handleDelete(customer.id, customer.cust_name)}
                  className="action-button danger"
                  title="Delete Customer"
                >
                  <span>🗑</span>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {currentCustomers.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No customers found</h3>
            <p>
              {search ? `No customers match "${search}"` : 'No customers registered yet'}
            </p>
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
            Page {currentPage} of {totalPages} ({sortedCustomers.length} customers)
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

      {/* Customer Detail Modal */}
      {showCustomerDetail && selectedCustomer && (
        <CustomerDetailModal 
          customer={selectedCustomer} 
          onClose={() => setShowCustomerDetail(false)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

// Customer Detail Modal Component
const CustomerDetailModal = ({ customer, onClose, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="modal-overlay-modern" onClick={onClose}>
      <div className="customer-modal-modern" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header-modern">
          <div className="header-content">
            <div className="customer-avatar-large">
              {getInitials(customer.cust_name)}
            </div>
            <div className="header-info">
              <h2 className="customer-title">{customer.cust_name || 'Unknown Customer'}</h2>
              <span className="customer-id-badge">ID: #{customer.id}</span>
            </div>
          </div>
          <button className="modal-close-modern" onClick={onClose}>
            <span>✕</span>
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="modal-body-modern">
          {/* Contact Information Card */}
          <div className="info-card">
            <div className="card-header">
              <h3>📧 Contact Information</h3>
            </div>
            <div className="card-content">
              <div className="info-row">
                <div className="info-label">Email Address</div>
                <div className="info-value email-value">
                  {customer.cust_email || 'Not provided'}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Phone Number</div>
                <div className="info-value">
                  {customer.cust_phone || 'Not provided'}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Address</div>
                <div className="info-value">
                  {customer.cust_address || 'Not provided'}
                </div>
              </div>
            </div>
          </div>

          {/* Account Information Card */}
          <div className="info-card">
            <div className="card-header">
              <h3>👤 Account Information</h3>
            </div>
            <div className="card-content">
              <div className="info-row">
                <div className="info-label">Customer ID</div>
                <div className="info-value">#{customer.id}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Registration Date</div>
                <div className="info-value">
                  {formatDate(customer.created_at)}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Last Updated</div>
                <div className="info-value">
                  {formatDate(customer.updated_at)}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Account Status</div>
                <div className="info-value">
                  <span className="status-badge-active">
                    {customer.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer-modern">
          <div className="action-buttons-modal">
            <button 
              onClick={() => {
                onDelete(customer.id, customer.cust_name);
                onClose();
              }}
              className="modal-btn delete-btn"
            >
              🗑️ Delete Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCustomer;
