import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart } from 'chart.js/auto';
import NetSuiteOAuth from '../components/NetSuiteOAuth';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const pieChartRef = useRef(null);

  const [productCount, setProductCount] = useState(0);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [activeModal, setActiveModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    url: ''
  });
  
  const [employeeForm, setEmployeeForm] = useState({
    emp_name: '',
    emp_email: '',
    emp_password: ''
  });

  // User profile states
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: 'Admin User',
    email: 'admin@ecom.com',
    avatar: null,
    role: 'Administrator'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsRes = await axios.get("http://localhost:8080/api/products");
        setProducts(productsRes.data);
        setProductCount(productsRes.data.length);
        
        // Fetch employees
        const employeesRes = await axios.get("http://localhost:8080/api/employees");
        setEmployees(employeesRes.data);
        setEmployeeCount(employeesRes.data.length);
        
        // Fetch customers (assuming API exists)
        try {
          const customersRes = await axios.get("http://localhost:8080/api/customers");
          setCustomerCount(customersRes.data.length);
        } catch (err) {
          console.log("Customers API not available");
          setCustomerCount(25); // Mock data
        }
        
        // Mock order count
        setOrderCount(156);
        
        // Render charts after data is loaded
        setTimeout(() => {
          renderBarChart(productsRes.data);
          renderPieChart(productsRes.data);
        }, 100);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderBarChart = (products) => {
    const ctx = chartRef.current.getContext('2d');
    if (window.bar) window.bar.destroy();

    const labels = products.map((p) => p.name);
    const data = products.map((p) => p.price);

    window.bar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Product Prices',
            data,
            backgroundColor: '#00B894',
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  };

  const renderPieChart = (products) => {
    const ctx = pieChartRef.current.getContext('2d');
    if (window.pie) window.pie.destroy();

    const categoryCounts = {};
    products.forEach((p) => {
      const cat = p.category || 'Uncategorized';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const labels = Object.keys(categoryCounts);
    const data = Object.values(categoryCounts);

    window.pie = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            label: 'Product Categories',
            data,
            backgroundColor: [
              '#74b9ff',
              '#55efc4',
              '#ffeaa7',
              '#fab1a0',
              '#a29bfe',
              '#fd79a8',
            ],
            borderColor: '#fff',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  // Profile dropdown handlers
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const closeProfileDropdown = () => {
    setShowProfileDropdown(false);
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(false);
    openModal('userProfile');
  };

  const handleSettingsClick = () => {
    setShowProfileDropdown(false);
    openModal('userSettings');
  };

  const handlePreferencesClick = () => {
    setShowProfileDropdown(false);
    openModal('userPreferences');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  // Modal handlers
  const openModal = (modalType) => {
    setActiveModal(modalType);
    if (modalType === 'addProduct') {
      setProductForm({ name: '', description: '', price: '', category: '', url: '' });
    } else if (modalType === 'addEmployee') {
      setEmployeeForm({ emp_name: '', emp_email: '', emp_password: '' });
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalLoading(false);
  };

  // Product form handlers
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await axios.post("http://localhost:8080/api/products", productForm);
      const updatedProducts = await axios.get("http://localhost:8080/api/products");
      setProducts(updatedProducts.data);
      setProductCount(updatedProducts.data.length);
      alert('Product added successfully!');
      closeModal();
      
      // Re-render charts with new data
      setTimeout(() => {
        renderBarChart(updatedProducts.data);
        renderPieChart(updatedProducts.data);
      }, 100);
    } catch (err) {
      console.error(err);
      alert('Failed to add product. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  // Employee form handlers
  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await axios.post("http://localhost:8080/api/employees", employeeForm);
      const updatedEmployees = await axios.get("http://localhost:8080/api/employees");
      setEmployees(updatedEmployees.data);
      setEmployeeCount(updatedEmployees.data.length);
      alert('Employee added successfully!');
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Failed to add employee. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEmployeeFormChange = (e) => {
    const { name, value } = e.target;
    setEmployeeForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await axios.delete(`http://localhost:8080/api/products/${id}`);
        console.log('Delete response:', response);
        
        const updatedProducts = await axios.get("http://localhost:8080/api/products");
        setProducts(updatedProducts.data);
        setProductCount(updatedProducts.data.length);
        alert('Product deleted successfully!');
        
        // Re-render charts
        setTimeout(() => {
          renderBarChart(updatedProducts.data);
          renderPieChart(updatedProducts.data);
        }, 100);
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

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axios.delete(`http://localhost:8080/api/employees/${id}`);
        const updatedEmployees = await axios.get("http://localhost:8080/api/employees");
        setEmployees(updatedEmployees.data);
        setEmployeeCount(updatedEmployees.data.length);
        alert('Employee deleted successfully!');
      } catch (err) {
        console.error(err);
        alert('Failed to delete employee. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3>Dashboard</h3>
            <button 
              className="nav-item active"
              onClick={() => navigate('/admin-dashboard')}
            >
              Overview
            </button>
          </div>
          
          <div className="nav-section">
            <h3>Products</h3>
            <button 
              className="nav-item"
              onClick={() => openModal('addProduct')}
            >
              Add Product
            </button>
            <button 
              className="nav-item"
              onClick={() => openModal('listProducts')}
            >
              List Products
            </button>
          </div>
          
          <div className="nav-section">
            <h3>Employees</h3>
            <button 
              className="nav-item"
              onClick={() => openModal('addEmployee')}
            >
              Add Employee
            </button>
            <button 
              className="nav-item"
              onClick={() => openModal('listEmployees')}
            >
              List Employees
            </button>
          </div>
          
          <div className="nav-section">
            <h3>Customers</h3>
            <button 
              className="nav-item"
              onClick={() => openModal('listCustomers')}
            >
              View Customers
            </button>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-content">
            <h1>Dashboard Overview</h1>
            <p>Welcome back! Here's what's happening with your store today.</p>
          </div>
          <div className="header-actions">
            <button className="refresh-btn" onClick={() => window.location.reload()}>
              Refresh
            </button>
            
            {/* User Profile Dropdown */}
            <div className="profile-dropdown-container">
              <button className="profile-trigger" onClick={toggleProfileDropdown}>
                <div className="profile-avatar">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} />
                  ) : (
                    <span className="avatar-initials">
                      {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="profile-info">
                  <span className="profile-name">{currentUser.name}</span>
                  <span className="profile-role">{currentUser.role}</span>
                </div>
                <svg className={`dropdown-arrow ${showProfileDropdown ? 'open' : ''}`} 
                     width="12" height="12" viewBox="0 0 12 12">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </button>

              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.name} />
                      ) : (
                        <span className="avatar-initials">
                          {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="dropdown-user-info">
                      <div className="dropdown-name">{currentUser.name}</div>
                      <div className="dropdown-email">{currentUser.email}</div>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <div className="dropdown-menu">
                    <button className="dropdown-item" onClick={handleProfileClick}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      My Profile
                    </button>
                    
                    <button className="dropdown-item" onClick={handleSettingsClick}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Settings
                    </button>
                    
                    <button className="dropdown-item" onClick={handlePreferencesClick}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Preferences
                    </button>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2"/>
                        <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2"/>
                        <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="stats-grid">
          <div className="stat-card products">
            <div className="stat-content">
              <h3>Total Products</h3>
              <p className="stat-number">{productCount}</p>
              <span className="stat-change">+12% from last month</span>
            </div>
          </div>
          
          <div className="stat-card employees">
            <div className="stat-content">
              <h3>Employees</h3>
              <p className="stat-number">{employeeCount}</p>
              <span className="stat-change">Active team members</span>
            </div>
          </div>
          
          <div className="stat-card customers">
            <div className="stat-content">
              <h3>Customers</h3>
              <p className="stat-number">{customerCount}</p>
              <span className="stat-change">+8% this week</span>
            </div>
          </div>
          
          <div className="stat-card orders">
            <div className="stat-content">
              <h3>Total Orders</h3>
              <p className="stat-number">{orderCount}</p>
              <span className="stat-change">+15% from last week</span>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className="charts-section">
          <div className="chart-container">
            <div className="chart-header">
              <h3>Product Price Analysis</h3>
              <p>Overview of product pricing across your inventory</p>
            </div>
            <div className="chart-content">
              <canvas ref={chartRef}></canvas>
            </div>
          </div>
          
          <div className="chart-container">
            <div className="chart-header">
              <h3>Category Distribution</h3>
              <p>Product distribution by categories</p>
            </div>
            <div className="chart-content">
              <canvas ref={pieChartRef}></canvas>
            </div>
          </div>
        </section>

        {/* NetSuite Integration Section */}
        <section className="netsuite-integration">
          <div className="netsuite-header">
            <h3>NetSuite Integration</h3>
            <p>Manage your NetSuite OAuth 2.0 connection for order synchronization</p>
          </div>
          <div className="netsuite-content">
            <NetSuiteOAuth />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-grid">
            <button 
              className="action-card"
              onClick={() => openModal('addProduct')}
            >
              <div>
                <h4>Add New Product</h4>
                <p>Add products to your inventory</p>
              </div>
            </button>
            
            <button 
              className="action-card"
              onClick={() => openModal('addEmployee')}
            >
              <div>
                <h4>Add Employee</h4>
                <p>Register new team member</p>
              </div>
            </button>
            
            <button 
              className="action-card"
              onClick={() => navigate('/admin-orders')}
            >
              <div>
                <h4>Manage Orders</h4>
                <p>View and update order status</p>
              </div>
            </button>
            
            <button 
              className="action-card"
              onClick={() => navigate('/stock-management')}
            >
              <div>
                <h4>Stock Management</h4>
                <p>Monitor and adjust inventory levels</p>
              </div>
            </button>
            
            <button 
              className="action-card"
              onClick={() => openModal('listCustomers')}
            >
              <div>
                <h4>View Customers</h4>
                <p>Check customer directory</p>
              </div>
            </button>
            
            <button 
              className="action-card"
              onClick={() => navigate('/admin/invoice-editor')}
            >
              <div>
                <h4>Edit Invoice PDF</h4>
                <p>Customize invoice template</p>
              </div>
            </button>
          </div>
        </section>
      </main>

      {/* Modal Components */}
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {activeModal === 'addProduct' && (
              <div className="modal-form">
                <div className="modal-header">
                  <h2>Add New Product</h2>
                  <button className="modal-close" onClick={closeModal}>×</button>
                </div>
                <form onSubmit={handleProductSubmit}>
                  <div className="form-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={productForm.name}
                      onChange={handleProductFormChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={productForm.description}
                      onChange={handleProductFormChange}
                      required
                      className="form-textarea"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      name="category"
                      value={productForm.category}
                      onChange={handleProductFormChange}
                      required
                      className="form-select"
                    >
                      <option value="">Select Category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Dress">Dress</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Kids">Kids</option>
                      <option value="Stationery">Stationery</option>
                      <option value="Groceries">Groceries</option>
                      <option value="Home Appliances">Home Appliances</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      value={productForm.price}
                      onChange={handleProductFormChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Image URL</label>
                    <input
                      type="url"
                      name="url"
                      value={productForm.url}
                      onChange={handleProductFormChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="button" onClick={closeModal} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" disabled={modalLoading} className="btn-primary">
                      {modalLoading ? 'Adding...' : 'Add Product'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeModal === 'addEmployee' && (
              <div className="modal-form">
                <div className="modal-header">
                  <h2>Add New Employee</h2>
                  <button className="modal-close" onClick={closeModal}>×</button>
                </div>
                <form onSubmit={handleEmployeeSubmit}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="emp_name"
                      value={employeeForm.emp_name}
                      onChange={handleEmployeeFormChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="emp_email"
                      value={employeeForm.emp_email}
                      onChange={handleEmployeeFormChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      name="emp_password"
                      value={employeeForm.emp_password}
                      onChange={handleEmployeeFormChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="button" onClick={closeModal} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" disabled={modalLoading} className="btn-primary">
                      {modalLoading ? 'Adding...' : 'Add Employee'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeModal === 'listProducts' && (
              <div className="modal-list">
                <div className="modal-header">
                  <h2>Product Inventory</h2>
                  <button className="modal-close" onClick={closeModal}>×</button>
                </div>
                <div className="modal-grid">
                  {products.map(p => (
                    <div key={p.id} className="modal-card">
                      <img src={p.url} alt={p.name} />
                      <h4>{p.name}</h4>
                      <p>{p.description}</p>
                      <div className="product-details">
                        <span className="price">₹{p.price}</span>
                        <span className="category-tag">{p.category || 'No Category'}</span>
                      </div>
                      <button onClick={() => handleDeleteProduct(p.id)} className="delete-btn">
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'listEmployees' && (
              <div className="modal-list">
                <div className="modal-header">
                  <h2>Employee Directory</h2>
                  <button className="modal-close" onClick={closeModal}>×</button>
                </div>
                <div className="modal-grid">
                  {employees.map(emp => (
                    <div key={emp.id} className="modal-card">
                      <div className="employee-avatar">
                        {emp.emp_name?.charAt(0).toUpperCase()}
                      </div>
                      <h4>{emp.emp_name}</h4>
                      <p className="employee-email">{emp.emp_email}</p>
                      <div className="employee-id">Employee ID: {emp.id}</div>
                      <button onClick={() => handleDeleteEmployee(emp.id)} className="delete-btn">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'listCustomers' && (
              <div className="modal-list">
                <div className="modal-header">
                  <h2>Customer Directory</h2>
                  <button className="modal-close" onClick={closeModal}>×</button>
                </div>
                <div className="modal-note">
                  <p>Customer management will be implemented here. Currently showing navigation to dedicated page.</p>
                  <button onClick={() => navigate('/view-customer')} className="btn-primary">
                    Go to Customer Management
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'userProfile' && (
              <div className="modal-form">
                <div className="modal-header">
                  <h2>My Profile</h2>
                  <button className="modal-close" onClick={closeModal}>×</button>
                </div>
                <div className="profile-modal-content">
                  <div className="profile-avatar-section">
                    <div className="profile-avatar-large">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.name} />
                      ) : (
                        <span className="avatar-initials-large">
                          {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      )}
                    </div>
                    <button className="change-avatar-btn">Change Avatar</button>
                  </div>
                  <form className="profile-form">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={currentUser.name}
                        className="form-input"
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={currentUser.email}
                        className="form-input"
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <input
                        type="text"
                        value={currentUser.role}
                        className="form-input"
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Login</label>
                      <input
                        type="text"
                        value={new Date().toLocaleDateString()}
                        className="form-input"
                        readOnly
                      />
                    </div>
                  </form>
                  <div className="modal-actions">
                    <button type="button" onClick={closeModal} className="btn-secondary">
                      Close
                    </button>
                    <button type="button" className="btn-primary">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'userSettings' && (
              <div className="modal-form">
                <div className="modal-header">
                  <h2>Settings</h2>
                  <button className="modal-close" onClick={closeModal}>×</button>
                </div>
                <div className="settings-modal-content">
                  <div className="settings-section">
                    <h3>Security</h3>
                    <div className="setting-item">
                      <label>Two-Factor Authentication</label>
                      <div className="setting-control">
                        <input type="checkbox" id="2fa" />
                        <label htmlFor="2fa" className="toggle-switch"></label>
                      </div>
                    </div>
                    <div className="setting-item">
                      <label>Login Notifications</label>
                      <div className="setting-control">
                        <input type="checkbox" id="loginNotifications" defaultChecked />
                        <label htmlFor="loginNotifications" className="toggle-switch"></label>
                      </div>
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3>Notifications</h3>
                    <div className="setting-item">
                      <label>Email Notifications</label>
                      <div className="setting-control">
                        <input type="checkbox" id="emailNotifications" defaultChecked />
                        <label htmlFor="emailNotifications" className="toggle-switch"></label>
                      </div>
                    </div>
                    <div className="setting-item">
                      <label>Push Notifications</label>
                      <div className="setting-control">
                        <input type="checkbox" id="pushNotifications" />
                        <label htmlFor="pushNotifications" className="toggle-switch"></label>
                      </div>
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3>Data & Privacy</h3>
                    <div className="setting-item">
                      <button className="setting-button">Download My Data</button>
                    </div>
                    <div className="setting-item">
                      <button className="setting-button danger">Delete Account</button>
                    </div>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="button" className="btn-primary">
                    Save Settings
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'userPreferences' && (
              <div className="modal-form">
                <div className="modal-header">
                  <h2>Preferences</h2>
                  <button className="modal-close" onClick={closeModal}>×</button>
                </div>
                <div className="preferences-modal-content">
                  <div className="preferences-section">
                    <h3>Appearance</h3>
                    <div className="preference-item">
                      <label>Theme</label>
                      <select className="form-select">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    <div className="preference-item">
                      <label>Language</label>
                      <select className="form-select">
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                  </div>

                  <div className="preferences-section">
                    <h3>Dashboard</h3>
                    <div className="preference-item">
                      <label>Default View</label>
                      <select className="form-select">
                        <option value="overview">Overview</option>
                        <option value="analytics">Analytics</option>
                        <option value="reports">Reports</option>
                      </select>
                    </div>
                    <div className="preference-item">
                      <label>Items per Page</label>
                      <select className="form-select">
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                  </div>

                  <div className="preferences-section">
                    <h3>Currency & Region</h3>
                    <div className="preference-item">
                      <label>Currency</label>
                      <select className="form-select">
                        <option value="INR">₹ Indian Rupee (INR)</option>
                        <option value="USD">$ US Dollar (USD)</option>
                        <option value="EUR">€ Euro (EUR)</option>
                      </select>
                    </div>
                    <div className="preference-item">
                      <label>Time Zone</label>
                      <select className="form-select">
                        <option value="IST">India Standard Time (IST)</option>
                        <option value="UTC">Coordinated Universal Time (UTC)</option>
                        <option value="PST">Pacific Standard Time (PST)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="button" className="btn-primary">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
