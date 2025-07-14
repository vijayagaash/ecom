import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AddEmployee() {
  const [employees, setEmployees] = useState([]);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://localhost:8080/api/employees", formData)
      .then(() => {
        fetchEmployees();
        setFormData({ emp_name: '', emp_email: '', emp_password: '' });
      })
      .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8080/api/employees/${id}`)
      .then(() => fetchEmployees())
      .catch(err => console.error(err));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Add New Employee</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="emp_name"
          placeholder="Full Name"
          value={formData.emp_name}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="email"
          name="emp_email"
          placeholder="Email"
          value={formData.emp_email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="emp_password"
          placeholder="Password"
          value={formData.emp_password}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.addBtn}>Add Employee</button>
      </form>

      <h3 style={styles.subHeading}>Employee List</h3>
      <div style={styles.grid}>
        {employees.map(emp => (
          <div key={emp.id} style={styles.card}>
            <div style={styles.avatar}>
              <span>{emp.emp_name?.charAt(0).toUpperCase()}</span>
            </div>
            <h4 style={styles.name}>{emp.emp_name}</h4>
            <p style={styles.email}>{emp.emp_email}</p>
            <button onClick={() => handleDelete(emp.id)} style={styles.deleteBtn}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    fontFamily: "'Segoe UI', sans-serif",
    backgroundColor: "#f4f6f8",
    minHeight: "100vh"
  },
  heading: {
    textAlign: "center",
    fontSize: "28px",
    marginBottom: "30px"
  },
  subHeading: {
    fontSize: "24px",
    marginTop: "40px",
    marginBottom: "10px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    maxWidth: "500px",
    margin: "auto",
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },
  addBtn: {
    padding: "12px",
    backgroundColor: "#2c3e50",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginTop: "20px"
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    padding: "15px",
    textAlign: "center",
    transition: "transform 0.2s ease"
  },
  avatar: {
    width: "50px",
    height: "50px",
    backgroundColor: "#3498db",
    color: "#fff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "auto",
    marginBottom: "10px",
    fontSize: "20px",
    fontWeight: "bold"
  },
  name: {
    fontSize: "18px",
    margin: "10px 0 5px 0"
  },
  email: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "10px"
  },
  deleteBtn: {
    background: "#e74c3c",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default AddEmployee;
