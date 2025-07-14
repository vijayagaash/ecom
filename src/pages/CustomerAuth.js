import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CustomerAuth() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({
    cust_name: '',
    cust_email: '',
    cust_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
        // ✅ Go to shop page
        } else {
          setError("Invalid credentials");
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>{isSignUp ? "Customer Sign Up" : "Customer Sign In"}</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {isSignUp && (
          <input
            type="text"
            name="cust_name"
            placeholder="Name"
            value={formData.cust_name}
            onChange={handleChange}
            required
            style={styles.input}
          />
        )}
        <input
          type="email"
          name="cust_email"
          placeholder="Email"
          value={formData.cust_email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="cust_password"
          placeholder="Password"
          value={formData.cust_password}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>

      <p style={{ marginTop: "10px" }}>
        {isSignUp ? "Already have an account?" : "Don't have an account?"}
        <button onClick={() => setIsSignUp(!isSignUp)} style={styles.toggleBtn}>
          {isSignUp ? "Sign In" : "Sign Up"}
        </button>
      </p>

      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9",
    textAlign: "center"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  input: {
    padding: "10px",
    fontSize: "16px"
  },
  button: {
    padding: "10px",
    backgroundColor: "#007bff",
    color: "white",
    fontSize: "16px",
    border: "none",
    cursor: "pointer"
  },
  toggleBtn: {
    marginLeft: "10px",
    background: "none",
    border: "none",
    color: "#007bff",
    cursor: "pointer",
    fontWeight: "bold"
  }
};

export default CustomerAuth;
