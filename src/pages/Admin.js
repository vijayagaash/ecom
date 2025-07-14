import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Admin.css'; // custom CSS file

function Admin() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    url: ''
  });

  // Fetch products
  const fetchProducts = () => {
    axios.get('http://localhost:8080/api/products')
      .then(res => setProducts(res.data));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add product
  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8080/api/products', formData)
      .then(() => {
        fetchProducts();
        setFormData({ name: '', description: '', price: '', url: '' });
      });
  };

  // Delete product
  const handleDelete = (id) => {
    axios.delete(`http://localhost:8080/api/products/${id}`)
      .then(() => fetchProducts());
  };

  return (
    <div className="admin-container">
      <nav className="navbar">
        <h1 className="logo">⚙️ Admin Panel</h1>
      </nav>

      <div className="form-section">
        <h2>Add New Product</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Product Name" value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          <input type="text" placeholder="Description" value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })} required />
          <input type="number" placeholder="Price" value={formData.price}
            onChange={e => setFormData({ ...formData, price: e.target.value })} required />
          <input type="text" placeholder="Image URL" value={formData.url}
            onChange={e => setFormData({ ...formData, url: e.target.value })} required />
          <button type="submit">Add Product</button>
        </form>
      </div>

      <div className="product-list">
        <h2>All Products</h2>
        <div className="product-grid">
          {products.map(p => (
            <div className="product-card" key={p.id}>
              <img src={p.url} alt={p.name} />
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <p className="price">₹{p.price}</p>
              <button onClick={() => handleDelete(p.id)} className="delete-btn">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Admin;
