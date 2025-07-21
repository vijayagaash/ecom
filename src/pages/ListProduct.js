import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

function ListProduct() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get("http://localhost:8080/api/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-form-container">
        <div className="admin-form-header">
          <h2>Product Catalog</h2>
          <p>Browse and search through all products in your inventory</p>
        </div>

        <div className="admin-navigation">
          <button 
            onClick={() => navigate('/admin-dashboard')} 
            className="refresh-btn"
          >
            ← Back to Dashboard
          </button>
          <button 
            onClick={() => navigate('/add-product')} 
            className="form-submit"
          >
            Add New Product
          </button>
        </div>
      </div>

      <div className="admin-search">
        <input
          type="text"
          placeholder="Search products by name or description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="admin-form-container">
        <div className="admin-grid">
          {filteredProducts.map(p => (
            <div key={p.id} className="admin-card">
              <img src={p.url} alt={p.name} />
              <h4>{p.name}</h4>
              <p>{p.description}</p>
              <div className="product-details">
                <span className="price">₹{p.price}</span>
                <span className="category-tag">
                  {p.category || 'No Category'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>
              {search ? `No products match "${search}"` : 'No products available in inventory'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListProduct;
