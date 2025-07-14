import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ViewCustomer() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    axios.get("http://localhost:8080/api/customers")
      .then(res => setCustomers(res.data))
      .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      axios.delete(`http://localhost:8080/api/customers/${id}`)
        .then(() => fetchCustomers())
        .catch(err => console.error(err));
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.cust_name.toLowerCase().includes(search.toLowerCase()) ||
    c.cust_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>View Customers</h2>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={styles.searchBar}
      />

      {filteredCustomers.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "20px" }}>No customers found.</p>
      ) : (
        <div style={styles.grid}>
          {filteredCustomers.map(c => (
            <div key={c.id} style={styles.card}>
              <div style={styles.avatar}>{c.cust_name.charAt(0).toUpperCase()}</div>
              <h4 style={styles.name}>{c.cust_name}</h4>
              <p style={styles.email}>{c.cust_email}</p>
              <button onClick={() => handleDelete(c.id)} style={styles.deleteBtn}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    fontFamily: "'Segoe UI', sans-serif",
    backgroundColor: "#f9fbfd",
    minHeight: "100vh"
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#2c3e50"
  },
  searchBar: {
    padding: "10px",
    fontSize: "16px",
    width: "100%",
    maxWidth: "400px",
    margin: "0 auto 30px auto",
    display: "block",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px"
  },
  card: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
    textAlign: "center",
    transition: "transform 0.2s ease",
  },
  avatar: {
    backgroundColor: "#007bff",
    color: "white",
    width: "50px",
    height: "50px",
    lineHeight: "50px",
    borderRadius: "50%",
    fontSize: "20px",
    margin: "0 auto 10px auto"
  },
  name: {
    margin: "10px 0 5px",
    fontSize: "18px",
    fontWeight: "600"
  },
  email: {
    color: "#555",
    fontSize: "14px"
  },
  deleteBtn: {
    marginTop: "15px",
    background: "#e74c3c",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer"
  }
};

export default ViewCustomer;
