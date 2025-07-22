import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from '../components/Loading';
import './StockManagement.css';

function StockManagement() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [notification, setNotification] = useState(null);
  const [editingStock, setEditingStock] = useState({});
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState({
    productId: null,
    productName: '',
    currentStock: 0,
    adjustment: '',
    reason: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showNotification('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleStockUpdate = async (productId, newStock) => {
    try {
      await axios.put(`http://localhost:8080/api/products/${productId}/stock`, {
        stock: parseInt(newStock)
      });
      
      // Update local state
      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, stock: parseInt(newStock) }
          : product
      ));
      
      setEditingStock({ ...editingStock, [productId]: false });
      showNotification('Stock updated successfully');
    } catch (error) {
      console.error('Error updating stock:', error);
      showNotification('Failed to update stock', 'error');
    }
  };

  const handleAdjustStock = async () => {
    try {
      const adjustment = parseInt(adjustmentData.adjustment);
      if (isNaN(adjustment)) {
        showNotification('Please enter a valid adjustment amount', 'error');
        return;
      }

      await axios.put(`http://localhost:8080/api/products/${adjustmentData.productId}/adjust-stock`, {
        adjustment: adjustment,
        reason: adjustmentData.reason
      });

      // Update local state
      setProducts(products.map(product => 
        product.id === adjustmentData.productId 
          ? { ...product, stock: adjustmentData.currentStock + adjustment }
          : product
      ));

      setShowAdjustmentModal(false);
      setAdjustmentData({
        productId: null,
        productName: '',
        currentStock: 0,
        adjustment: '',
        reason: ''
      });
      showNotification(`Stock adjusted successfully. ${adjustment > 0 ? 'Added' : 'Removed'} ${Math.abs(adjustment)} units.`);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      showNotification(error.response?.data?.message || 'Failed to adjust stock', 'error');
    }
  };

  const openAdjustmentModal = (product) => {
    setAdjustmentData({
      productId: product.id,
      productName: product.name,
      currentStock: product.stock,
      adjustment: '',
      reason: ''
    });
    setShowAdjustmentModal(true);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return 'out-of-stock';
    if (stock <= 10) return 'low-stock';
    if (stock <= 50) return 'medium-stock';
    return 'high-stock';
  };

  const getStockLabel = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    if (stock <= 50) return 'Medium Stock';
    return 'In Stock';
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesStock = stockFilter === 'All' || 
      (stockFilter === 'Out of Stock' && product.stock === 0) ||
      (stockFilter === 'Low Stock' && product.stock > 0 && product.stock <= 10) ||
      (stockFilter === 'In Stock' && product.stock > 10);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Get unique categories
  const categories = ['All', ...new Set(products.map(product => product.category).filter(Boolean))];

  const stockSummary = {
    total: products.length,
    inStock: products.filter(p => p.stock > 10).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((sum, product) => sum + (product.stock * product.price), 0)
  };

  if (loading) {
    return (
      <div className="stock-management-container">
        <Loading 
          message="Loading Stock Information"
          size="large"
          fullScreen={true}
        />
      </div>
    );
  }

  return (
    <div className="stock-management-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      {/* Header */}
      <div className="stock-header">
        <div className="header-left">
          <button onClick={() => navigate('/admin-dashboard')} className="back-btn">
            ← Back to Dashboard
          </button>
          <div className="header-title">
            <h1>Stock Management</h1>
            <p>Monitor and manage product inventory levels</p>
          </div>
        </div>
        <button onClick={fetchProducts} className="refresh-btn">
          Refresh Data
        </button>
      </div>

      {/* Stock Summary Cards */}
      <div className="stock-summary">
        <div className="summary-card total">
          <div className="card-content">
            <h3>{stockSummary.total}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="summary-card in-stock">
          <div className="card-content">
            <h3>{stockSummary.inStock}</h3>
            <p>In Stock</p>
          </div>
        </div>
        <div className="summary-card low-stock">
          <div className="card-content">
            <h3>{stockSummary.lowStock}</h3>
            <p>Low Stock</p>
          </div>
        </div>
        <div className="summary-card out-of-stock">
          <div className="card-content">
            <h3>{stockSummary.outOfStock}</h3>
            <p>Out of Stock</p>
          </div>
        </div>
        <div className="summary-card total-value">
          <div className="card-content">
            <h3>₹{stockSummary.totalValue.toFixed(2)}</h3>
            <p>Inventory Value</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="stock-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Stock Levels</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="stock-table-container">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id} className={getStockStatus(product.stock)}>
                <td className="product-info">
                  <div className="product-details">
                    <img 
                      src={product.url || '/placeholder.png'} 
                      alt={product.name}
                      className="product-image"
                      onError={(e) => { e.target.src = '/placeholder.png'; }}
                    />
                    <div>
                      <h4>{product.name}</h4>
                      <p>{product.description?.substring(0, 50)}...</p>
                    </div>
                  </div>
                </td>
                <td>{product.category || 'Uncategorized'}</td>
                <td>₹{product.price?.toFixed(2)}</td>
                <td className="stock-cell">
                  {editingStock[product.id] ? (
                    <div className="stock-edit">
                      <input
                        type="number"
                        min="0"
                        defaultValue={product.stock}
                        onBlur={(e) => handleStockUpdate(product.id, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleStockUpdate(product.id, e.target.value);
                          }
                        }}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <span
                      className="stock-value"
                      onClick={() => setEditingStock({ ...editingStock, [product.id]: true })}
                    >
                      {product.stock}
                    </span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${getStockStatus(product.stock)}`}>
                    {getStockLabel(product.stock)}
                  </span>
                </td>
                <td>₹{((product.stock || 0) * product.price).toFixed(2)}</td>
                <td className="actions-cell">
                  <button
                    onClick={() => openAdjustmentModal(product)}
                    className="action-btn adjust-btn"
                    title="Adjust Stock"
                  >
                    Adjust
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="no-products">
            <h3>No products found</h3>
            <p>No products match your current filters.</p>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustmentModal && (
        <div className="modal-overlay" onClick={() => setShowAdjustmentModal(false)}>
          <div className="adjustment-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Adjust Stock - {adjustmentData.productName}</h3>
              <button onClick={() => setShowAdjustmentModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="current-stock">
                <p><strong>Current Stock:</strong> {adjustmentData.currentStock} units</p>
              </div>
              <div className="form-group">
                <label>Adjustment Amount:</label>
                <input
                  type="number"
                  value={adjustmentData.adjustment}
                  onChange={(e) => setAdjustmentData({
                    ...adjustmentData,
                    adjustment: e.target.value
                  })}
                  placeholder="Enter positive number to add, negative to subtract"
                  className="adjustment-input"
                />
                <small>Use positive numbers to add stock, negative numbers to subtract</small>
              </div>
              <div className="form-group">
                <label>Reason (Optional):</label>
                <textarea
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData({
                    ...adjustmentData,
                    reason: e.target.value
                  })}
                  placeholder="e.g., New shipment, Damaged goods, Inventory correction"
                  className="reason-textarea"
                  rows="3"
                />
              </div>
              {adjustmentData.adjustment && (
                <div className="preview">
                  <p>
                    <strong>New Stock:</strong> 
                    {adjustmentData.currentStock + parseInt(adjustmentData.adjustment || 0)} units
                  </p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={handleAdjustStock} className="confirm-btn">
                Apply Adjustment
              </button>
              <button onClick={() => setShowAdjustmentModal(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockManagement;
