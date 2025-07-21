import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OrderConfirmation.css';

function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="order-confirmation-container">
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-confirmation-container">
        <div className="error-section">
          <h2>Order Not Found</h2>
          <p>{error || 'The order you are looking for could not be found.'}</p>
          <button onClick={() => navigate('/shop')} className="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-container">
      <div className="confirmation-content">
        <div className="success-header">
          <div className="success-icon">✓</div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase. Your order has been successfully placed.</p>
        </div>

        <div className="order-details-card">
          <div className="order-header">
            <h2>Order Details</h2>
            <div className="order-info">
              <div className="info-item">
                <span className="label">Order ID:</span>
                <span className="value">#{order.id}</span>
              </div>
              <div className="info-item">
                <span className="label">Order Date:</span>
                <span className="value">{new Date(order.orderDate).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <span className="label">Status:</span>
                <span className={`status ${order.status?.toLowerCase()}`}>{order.status}</span>
              </div>
            </div>
          </div>

          <div className="shipping-info">
            <h3>Shipping Information</h3>
            <div className="shipping-details">
              <p><strong>Address:</strong> {order.shippingAddress}</p>
              <p><strong>Email:</strong> {order.customerEmail}</p>
              <p><strong>Phone:</strong> {order.customerPhone}</p>
              <p><strong>Payment Method:</strong> {order.paymentMethod?.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>

          {order.orderItems && order.orderItems.length > 0 && (
            <div className="order-items-section">
              <h3>Order Items</h3>
              <div className="items-list">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="order-item">
                    <img 
                      src={item.productImageUrl || '/placeholder-image.jpg'} 
                      alt={item.productName}
                      className="item-image"
                    />
                    <div className="item-details">
                      <h4>{item.productName}</h4>
                      <p>{item.productDescription}</p>
                      <div className="item-pricing">
                        <span>Quantity: {item.quantity}</span>
                        <span>Price: ₹{item.unitPrice}</span>
                        <span className="item-total">Total: ₹{item.totalPrice}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{order.subtotal || 0}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>₹{order.shippingCost || 0}</span>
            </div>
            <div className="summary-row">
              <span>Tax:</span>
              <span>₹{order.tax || 0}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        <div className="confirmation-actions">
          <button onClick={() => navigate('/orders')} className="view-orders-btn">
            View All Orders
          </button>
          <button onClick={() => navigate('/shop')} className="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>

        <div className="next-steps">
          <h3>What happens next?</h3>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Order Processing</h4>
                <p>We'll prepare your order for shipment</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Shipping</h4>
                <p>Your order will be shipped to your address</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Delivery</h4>
                <p>Receive your order at your doorstep</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;
