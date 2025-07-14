import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Shop.css';
import { addToCart, getCartItems } from '../api/cartApi';
const customerId = localStorage.getItem("customerId"); 
function Shop() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    axios.get("http://localhost:8080/api/products")
      .then(res => setProducts(res.data));
      if (customerId) {
    getCartItems(customerId)
      .then(res => setCart(res.data))
      .catch(err => console.error("Failed to load cart", err));
  } else {
    console.warn("No customerId found in localStorage");
  }
  }, []);

  const handleAddToCart = (product) => {
    addToCart(customerId, product.id)
    .then(() => {
      setCart(prev => [...prev, { product }]);
      alert(`${product.name} added to cart!`);
    })
    .catch(err => console.error("Add to cart error", err));
  };

  const handleAddToWishlist = (product) => {
    const exists = wishlist.find(item => item.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
    } else {
      setWishlist(prev => [...prev, product]);
    }
  };

  const filteredProducts = filter === "All"
    ? products
    : products.filter(p => p.category?.toLowerCase() === filter.toLowerCase());

  return (
    <div className="shop-container">
      <nav className="navbar">
        <div className="logo">MyShop</div>
        <ul className="menu">
          <li><a href="/">Home</a></li>
          <li><a href="/admin">Admin</a></li>
        </ul>
        <div className="icons">
          <span title="Wishlist" className="icon">‪‪❤︎‬ {wishlist.length}</span>
          <span title="Cart" className="icon">🛒 {cart.length}</span>
        </div>
      </nav>

      <h2 className="title">Explore Products</h2>

      <div className="filter-bar">
        {["All", "Formals", "T-shirt", "Vest", "Hoodie"].map(type => (
          <button
            key={type}
            className={filter === type ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {filteredProducts.map(p => (
          <div className="product-card" key={p.id}>
            <div className="wishlist-icon" onClick={() => handleAddToWishlist(p)} title="Add to Wishlist">
              {wishlist.some(item => item.id === p.id) ? '♥' : '♡'}
            </div>
            <img src={p.url} alt={p.name} />
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <p className="price">₹{p.price}</p>
            <div className="card-buttons">
              <button onClick={() => handleAddToCart(p)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shop;
