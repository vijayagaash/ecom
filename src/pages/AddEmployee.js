import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

function AddEmployee() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    emp_name: '',
    emp_email: '',
    emp_password: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    axios.get("http://localhost:8080/api/employees")
      .then(res => setEmployees(res.data))
      .catch(err => console.error(err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:8080/api/employees", formData);
      await fetchEmployees();
      setFormData({ emp_name: '', emp_email: '', emp_password: '' });
      alert('Employee added successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to add employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axios.delete(`http://localhost:8080/api/employees/${id}`);
        await fetchEmployees();
        alert('Employee deleted successfully!');
      } catch (err) {
        console.error(err);
        alert('Failed to delete employee. Please try again.');
      }
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-form-container">
        <div className="admin-form-header">
          <h2>Add New Employee</h2>
          <p>Register new team members to your organization</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="emp_name"
              placeholder="Enter employee full name"
              value={formData.emp_name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="emp_email"
              placeholder="Enter email address"
              value={formData.emp_email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="emp_password"
              placeholder="Enter secure password"
              value={formData.emp_password}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <button type="submit" className="form-submit" disabled={loading}>
            {loading ? 'Adding Employee...' : 'Add Employee'}
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

      <div className="admin-form-container employees-section">
        <div className="admin-form-header">
          <h2>Employee Directory</h2>
          <p>Manage your team members</p>
        </div>

        <div className="admin-grid">
          {employees.map(emp => (
            <div key={emp.id} className="admin-card">
              <div className="employee-avatar">
                {emp.emp_name?.charAt(0).toUpperCase()}
              </div>
              <h4>{emp.emp_name}</h4>
              <p className="employee-email">{emp.emp_email}</p>
              <div className="employee-id">
                Employee ID: {emp.id}
              </div>
              <button onClick={() => handleDelete(emp.id)} className="delete-btn">
                Remove Employee
              </button>
            </div>
          ))}
        </div>

        {employees.length === 0 && (
          <div className="empty-state">
            <h3>No employees found</h3>
            <p>Add your first team member using the form above</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddEmployee;
