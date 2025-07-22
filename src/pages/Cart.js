import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCartItems, removeCartItem } from '../api/cartApi';
import Loading from '../components/Loading';
import './Cart.css';

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const customerId = localStorage.getItem("customerId");

  useEffect(() => {
    if (!customerId) {
      setError('Please login to view your cart');
      setLoading(false);
      return;
    }

    fetchCartItems();
  }, [customerId]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      console.log('Fetching cart for customer ID:', customerId);
      const response = await getCartItems(customerId);
      console.log('Cart API response:', response.data);
      setCartItems(response.data || []);
    } catch (err) {
      console.error('Failed to load cart items:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeCartItem(cartItemId);
      setCartItems(cartItems.filter(item => item.id !== cartItemId));
    } catch (err) {
      console.error('Failed to remove item:', err);
      alert('Failed to remove item from cart');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.18; // 18% GST
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  if (loading) {
    return (
      <div className="cart-container">
        <Loading 
          message="Loading your cart..."
          size="large"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-container">
        <div className="error">{error}</div>
        <button onClick={() => navigate('/customer-auth')} className="login-btn">
          Login
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <button onClick={() => navigate('/shop')} className="shop-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <header className="cart-header">
        <button onClick={() => navigate('/shop')} className="back-btn">
          ← Continue Shopping
        </button>
        <h1>Shopping Cart</h1>
        <span className="cart-count">{cartItems.length} items</span>
      </header>

      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-image">
                <img 
                  src={item.product?.url || '/placeholder-image.jpg'} 
                  alt={item.product?.name || 'Product'} 
                />
              </div>
              
              <div className="item-details">
                <h3>{item.product?.name || 'Unknown Product'}</h3>
                <p className="item-description">
                  {item.product?.description || 'No description available'}
                </p>
                <p className="item-category">
                  Category: {item.product?.category || 'N/A'}
                </p>
              </div>

              <div className="item-quantity">
                <label>Qty: </label>
                <span className="quantity">{item.quantity || 1}</span>
              </div>

              <div className="item-price">
                <span className="price">₹{item.product?.price || 0}</span>
                <span className="total-price">
                  ₹{(item.product?.price || 0) * (item.quantity || 1)}
                </span>
              </div>

              <button 
                onClick={() => handleRemoveItem(item.id)}
                className="remove-btn"
                title="Remove from cart"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-card">
            <h3>Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal ({cartItems.length} items):</span>
              <span>₹{calculateSubtotal().toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Tax (18% GST):</span>
              <span>₹{calculateTax(calculateSubtotal()).toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping:</span>
              <span className="free">FREE</span>
            </div>
            
            <hr />
            
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{calculateTotal().toFixed(2)}</span>
            </div>

            <button className="checkout-btn" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>

            <div className="security-info">
              <small>🔒 Secure checkout with SSL encryption</small>
            </div>
          </div>

          <div className="promo-code">
            <h4>Have a promo code?</h4>
            <div className="promo-input">
              <input type="text" placeholder="Enter promo code" />
              <button>Apply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
