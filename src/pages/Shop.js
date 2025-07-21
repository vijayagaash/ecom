import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Shop.css';
import { addToCart, getCartItems } from '../api/cartApi';

function Shop() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const customerId = localStorage.getItem("customerId");

  // Category configurations with professional business themes and UI elements
  const categoryConfig = {
    "Electronics": {
      icon: "⚡",
      color: "#1f2937",
      gradient: "linear-gradient(135deg, #1f2937 0%, #374151 30%, #4b5563 70%, #6b7280 100%)",
      bgPattern: "circuit-pattern",
      description: "Latest gadgets and technology",
      features: ["Tech Specs", "Warranty", "Reviews"]
    },
    "Dress": {
      icon: "👗",
      color: "#374151",
      gradient: "linear-gradient(135deg, #374151 0%, #4b5563 30%, #6b7280 70%, #9ca3af 100%)",
      bgPattern: "fashion-pattern",
      description: "Trendy fashion and clothing",
      features: ["Size Guide", "Material", "Style"]
    },
    "Accessories": {
      icon: "💎",
      color: "#475569",
      gradient: "linear-gradient(135deg, #475569 0%, #64748b 30%, #94a3b8 70%, #cbd5e1 100%)",
      bgPattern: "luxury-pattern",
      description: "Stylish accessories and jewelry",
      features: ["Premium Quality", "Craftsmanship", "Design"]
    },
    "Kids": {
      icon: "🧸",
      color: "#065f46",
      gradient: "linear-gradient(135deg, #065f46 0%, #047857 30%, #059669 70%, #10b981 100%)",
      bgPattern: "kids-pattern",
      description: "Fun and safe products for children",
      features: ["Safety Certified", "Age Appropriate", "Educational"]
    },
    "Stationery": {
      icon: "✏️",
      color: "#581c87",
      gradient: "linear-gradient(135deg, #581c87 0%, #6d28d9 30%, #7c3aed 70%, #8b5cf6 100%)",
      bgPattern: "office-pattern",
      description: "Office and school supplies",
      features: ["Quality Paper", "Ergonomic", "Durable"]
    },
    "Groceries": {
      icon: "🛒",
      color: "#134e4a",
      gradient: "linear-gradient(135deg, #134e4a 0%, #0f766e 30%, #0d9488 70%, #14b8a6 100%)",
      bgPattern: "organic-pattern",
      description: "Fresh groceries and daily essentials",
      features: ["Fresh Quality", "Organic Options", "Daily Essentials"]
    },
    "Home Appliances": {
      icon: "🏠",
      color: "#1e293b",
      gradient: "linear-gradient(135deg, #1e293b 0%, #334155 30%, #475569 70%, #64748b 100%)",
      bgPattern: "home-pattern",
      description: "Modern appliances for your home",
      features: ["Energy Efficient", "Smart Features", "Warranty"]
    }
  };

  const getCurrentCategoryConfig = () => {
    return categoryConfig[filter] || {
      icon: "🛍️",
      color: "#1f2937",
      gradient: "linear-gradient(135deg, #1f2937 0%, #374151 30%, #4b5563 70%, #6b7280 100%)",
      bgPattern: "default-pattern",
      description: "All categories available",
      features: ["Quality Products", "Best Prices", "Fast Delivery"]
    };
  };

  useEffect(() => {
    fetchProducts();
    if (customerId) {
      fetchCartItems();
    }
  }, [customerId]); // Added customerId as dependency

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async () => {
    try {
      const response = await getCartItems(customerId);
      setCart(response.data);
    } catch (error) {
      console.error("Failed to load cart", error);
    }
  };

  const handleAddToCart = async (product) => {
    if (!customerId) {
      navigate('/customer-auth');
      return;
    }

    try {
      await addToCart(customerId, product.id);
      setCart(prev => [...prev, { product }]);
      // Use a more modern notification instead of alert
      showNotification(`${product.name} added to cart!`);
    } catch (error) {
      console.error("Add to cart error", error);
      showNotification("Failed to add item to cart", "error");
    }
  };

  const handleAddToWishlist = (product) => {
    const exists = wishlist.find(item => item.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
      showNotification(`${product.name} removed from wishlist`);
    } else {
      setWishlist(prev => [...prev, product]);
      showNotification(`${product.name} added to wishlist`);
    }
  };

  const showNotification = (message, type = "success") => {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // ...existing code...

  const filteredProducts = products.filter(product => {
    const matchesFilter = filter === "All" || product.category?.toLowerCase() === filter.toLowerCase();
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Predefined categories with proper casing
  const predefinedCategories = ["All", "Electronics", "Dress", "Accessories", "Kids", "Stationery", "Groceries", "Home Appliances"];
  const productCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const categories = predefinedCategories.concat(productCategories.filter(cat => !predefinedCategories.includes(cat)));

  const currentConfig = getCurrentCategoryConfig();

  return (
    <div className={`shop-container ${filter !== "All" ? `category-${filter.toLowerCase().replace(' ', '-')}` : ''}`}>
      {/* Dynamic Category Header */}
      <header className="shop-header" style={{ background: currentConfig.gradient }}>
        <div className="header-content">
          <div className="logo-section">
            <h1 className="shop-logo" onClick={() => navigate('/')}>
              {currentConfig.icon} E-Com Store
            </h1>
            <span className="shop-tagline">{currentConfig.description}</span>
          </div>
          
          <nav className="shop-nav">
            <button onClick={() => navigate('/')} className="nav-link">Home</button>
            <button onClick={() => navigate('/orders')} className="nav-link">
              Orders ({cart.length})
            </button>
            <button onClick={() => navigate('/cart')} className="nav-link cart-link">
              Cart ({cart.length})
            </button>
          </nav>
          
          <div className="header-actions">
            {customerId ? (
              <button onClick={() => localStorage.removeItem('customerId') || navigate('/customer-auth')} className="auth-btn">
                Logout
              </button>
            ) : (
              <button onClick={() => navigate('/customer-auth')} className="auth-btn">
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Dynamic Hero Section */}
      <section className="shop-hero" style={{ background: currentConfig.gradient }}>
        <div className={`hero-content ${currentConfig.bgPattern}`}>
          <div className="hero-text">
            <h2>{currentConfig.icon} {filter === "All" ? "Discover Amazing Products" : `${filter} Collection`}</h2>
            <p>{currentConfig.description}</p>
            <div className="category-features">
              {currentConfig.features.map((feature, index) => (
                <span key={index} className="feature-badge">✓ {feature}</span>
              ))}
            </div>
          </div>
          {filter !== "All" && (
            <div className="category-stats">
              <div className="stat-card">
                <h3>{filteredProducts.length}</h3>
                <p>Products Available</p>
              </div>
              <div className="stat-card">
                <h3>★★★★★</h3>
                <p>Top Rated</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Search and Filter Section */}
      <section className="shop-controls">
        <div className="controls-content">
          <div className="search-section">
            <h3>Find Your Perfect Product</h3>
            <div className="search-bar">
              <input
                type="text"
                placeholder={`Search ${filter === "All" ? "all products" : filter.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Categories</h4>
            <div className="filter-buttons">
              {categories.map(category => {
                const config = categoryConfig[category];
                return (
                  <button
                    key={category}
                    className={`filter-btn ${filter === category ? 'active' : ''}`}
                    onClick={() => setFilter(category)}
                    style={{
                      '--category-color': config?.color || '#495057',
                      '--category-gradient': config?.gradient || 'linear-gradient(135deg, #1f2937 0%, #374151 30%, #4b5563 70%, #6b7280 100%)'
                    }}
                  >
                    {config?.icon || '📦'} {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Products Section */}
      <section className="products-section">
        <div className="products-content">
          <div className="products-header">
            <h3>
              {currentConfig.icon} {filter === "All" ? "All Products" : filter} ({filteredProducts.length})
            </h3>
            <div className="results-info">
              {searchTerm && (
                <span>Showing results for "{searchTerm}"</span>
              )}
              {filter !== "All" && (
                <span>Category: {filter}</span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="loading-section">
              <div className="loading-spinner"></div>
              <p>Loading {filter === "All" ? "products" : filter.toLowerCase()}...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">{currentConfig.icon}</div>
              <h4>No {filter === "All" ? "products" : filter.toLowerCase()} found</h4>
              <p>Try adjusting your search or filter criteria</p>
              <button onClick={() => { setSearchTerm(""); setFilter("All"); }} className="reset-btn">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className={`product-grid category-${filter.toLowerCase().replace(' ', '-')}-grid`}>
              {filteredProducts.map(product => (
                <div className={`product-card category-${product.category?.toLowerCase().replace(' ', '-') || 'default'}-card`} key={product.id}>
                  <div className="product-image-container">
                    <img 
                      src={product.url || '/placeholder-image.jpg'} 
                      alt={product.name}
                      onClick={() => handleProductClick(product.id)}
                    />
                    <button 
                      className={`wishlist-btn ${wishlist.some(item => item.id === product.id) ? 'active' : ''}`}
                      onClick={() => handleAddToWishlist(product)}
                      title={wishlist.some(item => item.id === product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      {wishlist.some(item => item.id === product.id) ? '♥' : '♡'}
                    </button>
                    {product.category && categoryConfig[product.category] && (
                      <div className="category-badge" style={{ backgroundColor: categoryConfig[product.category].color }}>
                        {categoryConfig[product.category].icon}
                      </div>
                    )}
                  </div>
                  
                  <div className="product-info">
                    <h4 onClick={() => handleProductClick(product.id)}>{product.name}</h4>
                    <p className="product-description">{product.description}</p>
                    <div className="product-meta">
                      {product.category && (
                        <span 
                          className="product-category" 
                          style={{ 
                            backgroundColor: categoryConfig[product.category]?.color || '#495057',
                            color: 'white'
                          }}
                        >
                          {categoryConfig[product.category]?.icon || '📦'} {product.category}
                        </span>
                      )}
                      <span className={`product-stock ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <div className="product-pricing">
                      <span className="product-price">₹{product.price}</span>
                      {product.category && categoryConfig[product.category] && (
                        <span className="category-features-mini">
                          {categoryConfig[product.category].features[0]}
                        </span>
                      )}
                    </div>
                    
                    <div className="product-actions">
                      <button 
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="add-to-cart-btn"
                        style={{
                          '--category-color': categoryConfig[product.category]?.color || '#495057'
                        }}
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                      <button 
                        onClick={() => handleProductClick(product.id)}
                        className="view-details-btn"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Shop;
