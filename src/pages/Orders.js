import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Invoice from '../components/Invoice';
import Loading from '../components/Loading';
import './Orders.css';

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const customerId = localStorage.getItem('customerId');

  useEffect(() => {
    if (!customerId) {
      navigate('/customer-auth');
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders for customer ID:', customerId);
      const response = await axios.get(`http://localhost:8080/api/orders/customer/${customerId}`);
      console.log('Orders API response:', response);
      console.log('Orders data:', response.data);
      console.log('Is array?', Array.isArray(response.data));
      
      // Ensure we always set an array
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        console.warn('Orders API returned non-array data:', response.data);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      setOrders([]); // Ensure orders is always an array on error
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (order) => {
    setSelectedOrder(order);
    setShowInvoice(true);
  };

  const closeInvoice = () => {
    setShowInvoice(false);
    setSelectedOrder(null);
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#ffc107';
      case 'CONFIRMED': return '#17a2b8';
      case 'PROCESSING': return '#fd7e14';
      case 'SHIPPED': return '#6f42c1';
      case 'DELIVERED': return '#28a745';
      case 'CANCELLED': return '#dc3545';
      case 'REFUNDED': return '#6c757d';
      default: return '#6c757d';
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
      <div className="orders-container">
        <Loading />
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <button onClick={() => navigate('/shop')} className="back-btn">
          ← Continue Shopping
        </button>
        <h1>My Orders</h1>
      </div>

      {!Array.isArray(orders) || orders.length === 0 ? (
        <div className="empty-orders">
          <h2>No orders found</h2>
          <p>You haven't placed any orders yet</p>
          <button onClick={() => navigate('/shop')} className="shop-btn">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="orders-content">
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.id}</h3>
                    <p className="order-date">Placed on {formatDate(order.orderDate)}</p>
                  </div>
                  <div className="order-status">
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getOrderStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-summary">
                    <div className="summary-item">
                      <span>Total Amount:</span>
                      <span className="amount">₹{order.totalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="summary-item">
                      <span>Items:</span>
                      <span>{order.orderItems?.length || 0} items</span>
                    </div>
                    <div className="summary-item">
                      <span>Shipping:</span>
                      <span>
                        {order.shippingCost === 0 ? (
                          <span className="free">Free</span>
                        ) : (
                          `₹${order.shippingCost?.toFixed(2)}`
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="view-details-btn"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleViewInvoice(order)}
                      className="view-invoice-btn"
                    >
                      <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      View Invoice
                    </button>
                  </div>
                </div>

                {order.shippingAddress && (
                  <div className="shipping-info">
                    <strong>Shipping Address:</strong>
                    <p>{order.shippingAddress}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details - #{selectedOrder.id}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="order-info-section">
                <h3>Order Information</h3>
                <div className="info-grid">
                  <div>
                    <strong>Order Date:</strong>
                    <p>{selectedOrder.orderDate ? formatDate(selectedOrder.orderDate) : 'Not available'}</p>
                  </div>
                  <div>
                    <strong>Status:</strong>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getOrderStatusColor(selectedOrder.status || 'PENDING') }}
                    >
                      {selectedOrder.status || 'PENDING'}
                    </span>
                  </div>
                  <div>
                    <strong>Email:</strong>
                    <p>{selectedOrder.customerEmail || 'Not available'}</p>
                  </div>
                  <div>
                    <strong>Phone:</strong>
                    <p>{selectedOrder.customerPhone || 'Not available'}</p>
                  </div>
                </div>
              </div>

              <div className="order-items-section">
                <h3>Order Items</h3>
                <div className="items-list">
                  {selectedOrder.orderItems?.map(item => (
                    <div key={item.id} className="item-row">
                      <div className="item-name">{item.productName || 'Product'}</div>
                      <div className="item-quantity">Qty: {item.quantity || 0}</div>
                      <div className="item-price">₹{(item.price || item.unitPrice || 0).toFixed(2)}</div>
                      <div className="item-total">₹{((item.price || item.unitPrice || 0) * (item.quantity || 0)).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-totals-section">
                <div className="totals-grid">
                  <div>Subtotal: ₹{((selectedOrder.totalAmount || 0) - (selectedOrder.shippingCost || 0) - (selectedOrder.tax || 0)).toFixed(2)}</div>
                  <div>Shipping: ₹{(selectedOrder.shippingCost || 0).toFixed(2)}</div>
                  <div>Tax: ₹{(selectedOrder.tax || 0).toFixed(2)}</div>
                  <div className="total-amount">Total: ₹{(selectedOrder.totalAmount || 0).toFixed(2)}</div>
                </div>
              </div>

              <div className="addresses-section">
                <div className="address-block">
                  <h4>Shipping Address</h4>
                  <p>{selectedOrder.shippingAddress || 'Not provided'}</p>
                </div>
                <div className="address-block">
                  <h4>Billing Address</h4>
                  <p>{selectedOrder.billingAddress || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && selectedOrder && (
        <Invoice 
          order={selectedOrder}
          onClose={closeInvoice}
        />
      )}
    </div>
  );
}

export default Orders;
