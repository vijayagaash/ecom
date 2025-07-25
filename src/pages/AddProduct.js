import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

function AddProduct() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  // Hardcoded categories to match Shop.js exactly - CACHE BUSTED VERSION
  const [categories, setCategories] = useState([
    'Electronics',
    'Dress', 
    'Accessories',
    'Kids',
    'Stationery',
    'Groceries',
    'Home Appliances'
  ]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now()); // Force refresh with timestamp
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    url: ''
  });

  useEffect(() => {
    fetchProducts();
    // Categories are now hardcoded, no need to fetch from API
  }, []);

  const fetchProducts = () => {
    axios.get("http://localhost:8080/api/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  };

  // Categories are now hardcoded - keeping this function commented for reference
  /*
  const fetchCategories = () => {
    console.log('Fetching categories from backend...');
    // Add timestamp to URL to prevent any caching
    const timestamp = new Date().getTime();
    const url = `http://localhost:8080/api/products/categories-fresh?t=${timestamp}`;
    
    axios.get(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
      .then(res => {
        console.log('Categories received from backend:', res.data);
        console.log('Setting categories state to:', res.data);
        setCategories(res.data);
        setRefreshKey(prev => prev + 1); // Force component refresh
        // Force a re-render by updating the key
        console.log('Categories state updated successfully');
      })
      .catch(err => {
        console.error('Failed to fetch categories:', err);
        // Fallback to shop categories if API fails
        const fallbackCategories = ['Electronics', 'Dress', 'Accessories', 'Kids', 'Stationery', 'Groceries', 'Home Appliances'];
        console.log('Using fallback categories:', fallbackCategories);
        setCategories(fallbackCategories);
        setRefreshKey(prev => prev + 1); // Force component refresh
      });
  };
  */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:8080/api/products", formData);
      await fetchProducts();
      // Categories are hardcoded, no need to refresh them
      setFormData({ name: '', description: '', price: '', category: '', url: '' });
      alert('Product added successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await axios.delete(`http://localhost:8080/api/products/${id}`);
        console.log('Delete response:', response);
        
        await fetchProducts();
        alert('Product deleted successfully!');
      } catch (err) {
        console.error('Delete product error:', err);
        console.error('Error response:', err.response);
        
        let errorMessage = 'Failed to delete product. Please try again.';
        
        if (err.response) {
          // Server responded with error status
          if (err.response.status === 404) {
            errorMessage = 'Product not found. It may have already been deleted.';
          } else if (err.response.status === 409) {
            errorMessage = err.response.data?.message || 'Cannot delete product. It may be referenced in existing orders.';
          } else if (err.response.status === 500) {
            errorMessage = err.response.data?.message || 'Server error occurred while deleting product.';
          } else {
            errorMessage = err.response.data?.message || `Failed to delete product: ${err.response.statusText}`;
          }
        } else if (err.request) {
          // Network error - check if server is running
          errorMessage = 'Network error. Please check if the server is running at http://localhost:8080';
        }
        
        alert(errorMessage);
      }
    }
  };

  return (
    <div className="admin-page" key={`admin-page-${refreshKey}`}>
      <div className="admin-form-container">
        <div className="admin-form-header">
          <h2>Add New Product</h2>
          <p>Add products to your store inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input 
              type="text" 
              name="name" 
              placeholder="Enter product name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              name="description" 
              placeholder="Enter product description" 
              value={formData.description} 
              onChange={handleChange} 
              required 
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              required 
              className="form-select"
              key={`category-select-${refreshKey}-${categories.length}`}
            >
              <option value="">Select Category</option>
              {categories.map((category, index) => {
                console.log('Rendering category option:', category, 'at', new Date().toISOString());
                return (
                  <option key={`${category}-${index}-${refreshKey}`} value={category}>
                    {category}
                  </option>
                );
              })}
            </select>
            <small className="form-hint">
              These categories match the shop filters. Choose the appropriate category for proper product display.
            </small>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              Categories (updated {new Date().toLocaleTimeString()}): {categories.join(', ')}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Price (Rs.)</label>
            <input 
              type="number" 
              name="price" 
              placeholder="Enter price" 
              value={formData.price} 
              onChange={handleChange} 
              required 
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input 
              type="url" 
              name="url" 
              placeholder="Enter image URL" 
              value={formData.url} 
              onChange={handleChange} 
              required 
              className="form-input"
            />
          </div>

          <button type="submit" className="form-submit" disabled={loading}>
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>

        <div className="admin-navigation">
          <button 
            onClick={() => navigate('/admin-dashboard')} 
            className="refresh-btn"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="admin-form-container inventory-section">
        <div className="admin-form-header">
          <h2>Product Inventory</h2>
          <p>Manage your existing products</p>
        </div>

        <div className="admin-grid">
          {products.map(p => (
            <div key={p.id} className="admin-card">
              <img src={p.url} alt={p.name} />
              <h4>{p.name}</h4>
              <p>{p.description}</p>
              <div className="product-details">
                <span className="price">Rs.{p.price}</span>
                <span className="category-tag">
                  {p.category || 'No Category'}
                </span>
              </div>
              <button onClick={() => handleDelete(p.id)} className="delete-btn">
                Delete Product
              </button>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Add your first product using the form above</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddProduct;
