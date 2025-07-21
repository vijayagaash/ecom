import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [orderData, setOrderData] = useState({
    shippingAddress: '',
    customerEmail: '',
    customerPhone: '',
    paymentMethod: 'credit_card'
  });

  const customerId = localStorage.getItem('customerId');

  useEffect(() => {
    if (!customerId) {
      navigate('/customer-auth');
      return;
    }
    fetchCartItems();
    fetchCustomerData();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/cart/${customerId}`);
      const items = response.data;
      
      // Fetch product details for each cart item
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const productResponse = await axios.get(`http://localhost:8080/api/products/${item.productId}`);
          return {
            ...item,
            product: productResponse.data,
            total: productResponse.data.price * item.quantity
          };
        })
      );
      setCartItems(itemsWithProducts);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const fetchCustomerData = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/customers/${customerId}`);
      setCustomer(response.data);
      setOrderData(prev => ({
        ...prev,
        customerEmail: response.data.cust_email
      }));
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateShipping = () => {
    return calculateSubtotal() > 500 ? 0 : 50; // Free shipping over ₹500
  };

  const calculateTax = () => {
    return Math.round(calculateSubtotal() * 0.18); // 18% GST
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderPayload = {
        customerId: parseInt(customerId),
        shippingAddress: orderData.shippingAddress,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        paymentMethod: orderData.paymentMethod
      };

      const response = await axios.post('http://localhost:8080/api/orders/checkout', orderPayload);
      
      if (response.data) {
        alert('Order placed successfully!');
        navigate(`/order-confirmation/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-checkout">
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart before checking out</p>
          <button onClick={() => navigate('/shop')} className="shop-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button onClick={() => navigate('/cart')} className="back-btn">
          ← Back to Cart
        </button>
        <h1>Checkout</h1>
      </div>

      <div className="checkout-content">
        <div className="checkout-form">
          <form onSubmit={handlePlaceOrder}>
            <div className="form-section">
              <h3>Shipping Information</h3>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={orderData.customerEmail}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={orderData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Shipping Address</label>
                <textarea
                  name="shippingAddress"
                  value={orderData.shippingAddress}
                  onChange={handleInputChange}
                  placeholder="Enter your complete address"
                  required
                  className="form-textarea"
                  rows="4"
                />
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="form-section">
              <h3>Order Summary</h3>
              <div className="checkout-order-summary">
                <div className="order-items-list">
                  {cartItems.map(item => (
                    <div key={item.id} className="checkout-order-item">
                      <img 
                        src={item.product?.url || '/placeholder-image.jpg'} 
                        alt={item.product?.name || 'Product'} 
                        className="checkout-item-image" 
                      />
                      <div className="checkout-item-info">
                        <h5>{item.product?.name || 'Unknown Product'}</h5>
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: ₹{item.product?.price || 0}</p>
                      </div>
                      <div className="checkout-item-total">₹{(item.total || 0).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                
                <div className="checkout-summary-totals">
                  <div className="checkout-summary-row">
                    <span>Subtotal:</span>
                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="checkout-summary-row">
                    <span>Shipping:</span>
                    <span>{calculateShipping() === 0 ? 'Free' : `₹${calculateShipping().toFixed(2)}`}</span>
                  </div>
                  <div className="checkout-summary-row">
                    <span>Tax (GST 18%):</span>
                    <span>₹{calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="checkout-summary-row checkout-total-row">
                    <span>Total:</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Payment Method</h3>
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={orderData.paymentMethod === 'credit_card'}
                    onChange={handleInputChange}
                  />
                  <span>Credit/Debit Card</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={orderData.paymentMethod === 'upi'}
                    onChange={handleInputChange}
                  />
                  <span>UPI</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={orderData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                  />
                  <span>Cash on Delivery</span>
                </label>
              </div>
            </div>

            <button type="submit" className="place-order-btn" disabled={loading}>
              {loading ? 'Placing Order...' : `Place Order - ₹${calculateTotal().toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
