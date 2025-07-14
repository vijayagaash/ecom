import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get("http://localhost:8080/api/employees");
      const admin = res.data.find(emp => emp.emp_email === email && emp.emp_password === password);

      if (admin) {
        navigate("/admin-dashboard");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("Login failed. Try again.");
    }
  };

  return (
    <div style={styles.body}>
        <div style={styles.container}>
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={styles.input} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={styles.input} />
        <button type="submit" style={styles.button}>Login</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
    </div>
    
  );
}

const styles = {
    body: {
        width: "100%",
        height: "100vh",
        backgroundImage: "url('https://4kwallpapers.com/images/wallpapers/business-barcode-3840x2160-16395.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        
    },
  container: {
    padding: "30px",
    maxWidth: "400px",
    margin: "auto",
    marginTop: "100px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    backgroundImage: "url('')",   

  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  input: {
    padding: "10px",
    fontSize: "16px"
    , borderRadius: "10px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#000000",
    color: "white",
    border: "none",
    fontSize: "16px",
    cursor: "pointer"
  }
};

export default AdminLogin;
