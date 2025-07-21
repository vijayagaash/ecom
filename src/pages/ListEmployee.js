import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

function ListEmployee() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get("http://localhost:8080/api/employees")
      .then(res => setEmployees(res.data))
      .catch(err => console.error(err));
  }, []);

  const filteredEmployees = employees.filter(emp =>
    emp.emp_name.toLowerCase().includes(search.toLowerCase()) ||
    emp.emp_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-form-container">
        <div className="admin-form-header">
          <h2>Employee Directory</h2>
          <p>Browse and manage all employees in your organization</p>
        </div>

        <div className="admin-navigation">
          <button 
            onClick={() => navigate('/admin-dashboard')} 
            className="refresh-btn"
          >
            ← Back to Dashboard
          </button>
          <button 
            onClick={() => navigate('/add-employee')} 
            className="form-submit"
          >
            Add New Employee
          </button>
        </div>
      </div>

      <div className="admin-search">
        <input
          type="text"
          placeholder="Search employees by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="admin-form-container">
        <div className="admin-grid">
          {filteredEmployees.map(emp => (
            <div key={emp.id} className="admin-card">
              <div className="employee-avatar">
                {emp.emp_name?.charAt(0).toUpperCase()}
              </div>
              <h4>{emp.emp_name}</h4>
              <p className="employee-email">{emp.emp_email}</p>
              <div className="employee-id">
                Employee ID: {emp.id}
              </div>
            </div>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="empty-state">
            <h3>No employees found</h3>
            <p>
              {search ? `No employees match "${search}"` : 'No employees available in directory'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListEmployee;
