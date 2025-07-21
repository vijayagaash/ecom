import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CustomerAuth.css';

function CustomerAuth() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({
    cust_name: '',
    cust_email: '',
    cust_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        await axios.post("http://localhost:8080/api/customers", formData);
        setSuccess("Signup successful! Please log in.");
        setIsSignUp(false);
        setFormData({ cust_name: '', cust_email: '', cust_password: '' });
      } else {
        const res = await axios.get("http://localhost:8080/api/customers");
        const user = res.data.find(c =>
          c.cust_email === formData.cust_email && c.cust_password === formData.cust_password
        );

        if (user) {
          setSuccess(`Welcome back, ${user.cust_name}!`);
          localStorage.setItem("customer", JSON.stringify(user));
          localStorage.setItem("customerId", user.id);
          navigate("/shop");
        } else {
          setError("Invalid credentials");
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-auth-container">
      <div className="customer-auth-card">
        <div className="auth-header">
          <h2>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
          <p>{isSignUp ? "Join us to start shopping" : "Sign in to your account"}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="cust_name"
                placeholder="Enter your full name"
                value={formData.cust_name}
                onChange={handleChange}
                required
                className="auth-input"
                disabled={loading}
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="cust_email"
              placeholder="Enter your email"
              value={formData.cust_email}
              onChange={handleChange}
              required
              className="auth-input"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="cust_password"
              placeholder="Enter your password"
              value={formData.cust_password}
              onChange={handleChange}
              required
              className="auth-input"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? "Create Account" : "Sign In")}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccess('');
                setFormData({ cust_name: '', cust_email: '', cust_password: '' });
              }} 
              className="toggle-btn"
              disabled={loading}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>

        <div className="auth-footer">
          <button onClick={() => navigate('/')} className="back-home-btn">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerAuth;
