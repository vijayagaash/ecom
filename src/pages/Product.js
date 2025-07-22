import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { addToCart } from '../api/cartApi';
import Loading from '../components/Loading';
import './Product.css';

function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const customerId = localStorage.getItem('customerId') || 1;

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/products/${id}`);
      setProduct(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addToCart(customerId, product.id, quantity);
      alert(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="product-container">
        <Loading 
          message="Loading product details..."
          size="large"
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-container">
        <div className="error">Product not found</div>
        <button onClick={() => navigate('/shop')} className="back-btn">
          ← Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="product-container">
      <div className="product-header">
        <button onClick={() => navigate('/shop')} className="back-btn">
          ← Back to Shop
        </button>
      </div>

      <div className="product-content">
        <div className="product-image-section">
          <div className="main-image">
            <img src={product.url} alt={product.name} />
          </div>
        </div>

        <div className="product-info-section">
          <div className="product-breadcrumb">
            <span>Shop</span> / <span>{product.category || 'Products'}</span> / <span>{product.name}</span>
          </div>

          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-price">
            <span className="current-price">₹{product.price}</span>
            <span className="stock-info">
              {product.stock > 0 ? (
                <span className="in-stock">✓ In Stock ({product.stock} available)</span>
              ) : (
                <span className="out-of-stock">✗ Out of Stock</span>
              )}
            </span>
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description || 'No description available for this product.'}</p>
          </div>

          <div className="product-details">
            <div className="detail-item">
              <strong>Category:</strong> {product.category || 'Not specified'}
            </div>
            <div className="detail-item">
              <strong>Product ID:</strong> {product.id}
            </div>
            {product.createdAt && (
              <div className="detail-item">
                <strong>Added:</strong> {new Date(product.createdAt).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="product-actions">
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="qty-btn"
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="qty-btn"
                >
                  +
                </button>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                className="add-to-cart-btn"
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              
              <button 
                onClick={handleBuyNow}
                disabled={product.stock === 0 || addingToCart}
                className="buy-now-btn"
              >
                Buy Now
              </button>
            </div>
          </div>

          <div className="product-features">
            <div className="feature">
              <span className="feature-icon">🚚</span>
              <div>
                <strong>Free Shipping</strong>
                <p>On orders over ₹500</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">🔄</span>
              <div>
                <strong>Easy Returns</strong>
                <p>30-day return policy</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">🔒</span>
              <div>
                <strong>Secure Payment</strong>
                <p>SSL encrypted checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
