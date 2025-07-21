import React, { useState } from 'react';
import axios from 'axios';
import NetSuiteStatus from './NetSuiteStatus';
import './EnhancedCheckout.css';

const EnhancedCheckout = ({ cartItems, customerId, onOrderSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [orderResult, setOrderResult] = useState(null);
    const [formData, setFormData] = useState({
        shippingAddress: '',
        customerEmail: '',
        customerPhone: '',
        paymentMethod: 'credit_card'
    });

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const orderData = {
                customerId,
                shippingAddress: formData.shippingAddress,
                customerEmail: formData.customerEmail,
                customerPhone: formData.customerPhone,
                paymentMethod: formData.paymentMethod
            };

            const response = await axios.post('/api/orders/checkout', orderData);
            
            if (response.data.success) {
                setOrderResult({
                    success: true,
                    order: response.data.order,
                    netsuiteSync: response.data.netsuiteSync,
                    message: response.data.message,
                    netsuiteMessage: response.data.netsuiteMessage
                });

                // Notify parent component
                if (onOrderSuccess) {
                    onOrderSuccess(response.data.order);
                }
            } else {
                setOrderResult({
                    success: false,
                    message: response.data.error || 'Failed to create order'
                });
            }
        } catch (error) {
            console.error('Checkout error:', error);
            setOrderResult({
                success: false,
                message: error.response?.data?.error || 'An error occurred during checkout'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = (orderId, newStatus) => {
        if (orderResult && orderResult.order) {
            setOrderResult(prev => ({
                ...prev,
                order: {
                    ...prev.order,
                    status: newStatus
                },
                netsuiteSync: 'success',
                netsuiteMessage: 'Order successfully synced with NetSuite'
            }));
        }
    };

    if (orderResult) {
        return (
            <div className="enhanced-checkout">
                <div className="order-result">
                    {orderResult.success ? (
                        <div className="order-success">
                            <div className="success-header">
                                <span className="success-icon">🎉</span>
                                <h2>Order Created Successfully!</h2>
                            </div>
                            
                            <div className="order-summary">
                                <h3>Order #{orderResult.order.id}</h3>
                                <p><strong>Total Amount:</strong> ₹{orderResult.order.totalAmount}</p>
                                <p><strong>Order Date:</strong> {new Date(orderResult.order.orderDate).toLocaleString()}</p>
                            </div>

                            <NetSuiteStatus 
                                order={orderResult.order} 
                                onStatusUpdate={handleStatusUpdate}
                            />

                            <div className="integration-status">
                                <h4>Integration Status:</h4>
                                <div className={`status-badge ${orderResult.netsuiteSync}`}>
                                    {orderResult.netsuiteSync === 'success' ? '✅' : '⏳'} {orderResult.netsuiteMessage}
                                </div>
                            </div>

                            <button 
                                className="continue-shopping-btn"
                                onClick={() => window.location.href = '/shop'}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="order-error">
                            <span className="error-icon">❌</span>
                            <h2>Order Failed</h2>
                            <p>{orderResult.message}</p>
                            <button 
                                className="retry-btn"
                                onClick={() => setOrderResult(null)}
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="enhanced-checkout">
            <div className="checkout-container">
                <h2>Checkout</h2>
                
                <div className="checkout-content">
                    <div className="order-summary-section">
                        <h3>Order Summary</h3>
                        <div className="cart-items">
                            {cartItems.map(item => (
                                <div key={item.id} className="cart-item">
                                    <span className="item-name">{item.name}</span>
                                    <span className="item-quantity">x{item.quantity}</span>
                                    <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="total-amount">
                            <strong>Total: ₹{calculateTotal().toFixed(2)}</strong>
                        </div>
                    </div>

                    <form onSubmit={handleCheckout} className="checkout-form">
                        <div className="form-section">
                            <h3>Shipping Information</h3>
                            
                            <div className="form-group">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    name="customerEmail"
                                    value={formData.customerEmail}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="customerPhone"
                                    value={formData.customerPhone}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter your phone number"
                                />
                            </div>

                            <div className="form-group">
                                <label>Shipping Address *</label>
                                <textarea
                                    name="shippingAddress"
                                    value={formData.shippingAddress}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter your complete shipping address"
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Payment Method</h3>
                            <div className="payment-methods">
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="credit_card"
                                        checked={formData.paymentMethod === 'credit_card'}
                                        onChange={handleInputChange}
                                    />
                                    <span>Credit/Debit Card</span>
                                </label>
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="upi"
                                        checked={formData.paymentMethod === 'upi'}
                                        onChange={handleInputChange}
                                    />
                                    <span>UPI</span>
                                </label>
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash_on_delivery"
                                        checked={formData.paymentMethod === 'cash_on_delivery'}
                                        onChange={handleInputChange}
                                    />
                                    <span>Cash on Delivery</span>
                                </label>
                            </div>
                        </div>

                        <div className="netsuite-info">
                            <h4>🚀 Enhanced with NetSuite Integration</h4>
                            <p>Your order will be automatically synced with our NetSuite system for:</p>
                            <ul>
                                <li>Real-time inventory management</li>
                                <li>Automated customer account creation</li>
                                <li>Seamless order tracking</li>
                                <li>Integrated financial reporting</li>
                            </ul>
                        </div>

                        <button 
                            type="submit" 
                            className="place-order-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Processing Order...
                                </>
                            ) : (
                                `Place Order - ₹${calculateTotal().toFixed(2)}`
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EnhancedCheckout;
