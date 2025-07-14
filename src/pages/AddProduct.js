import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AddProduct() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    url: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get("http://localhost:8080/api/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://localhost:8080/api/products", formData)
      .then(() => {
        fetchProducts();
        setFormData({ name: '', description: '', price: '', url: '' });
      })
      .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8080/api/products/${id}`)
      .then(() => fetchProducts())
      .catch(err => console.error(err));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Add New Product</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required style={styles.input} />
        <input type="text" name="description" placeholder="Product Description" value={formData.description} onChange={handleChange} required style={styles.input} />
        <input type="number" name="price" placeholder="Price (₹)" value={formData.price} onChange={handleChange} required style={styles.input} />
        <input type="text" name="url" placeholder="Image URL" value={formData.url} onChange={handleChange} required style={styles.input} />
        <button type="submit" style={styles.addBtn}>Add Product</button>
      </form>

      <h3 style={styles.subHeading}>Available Products</h3>
      <div style={styles.grid}>
        {products.map(p => (
          <div key={p.id} style={styles.card}>
            <img src={p.url} alt={p.name} style={styles.image} />
            <h4 style={styles.cardTitle}>{p.name}</h4>
            <p style={styles.desc}>{p.description}</p>
            <p style={styles.price}>₹{p.price}</p>
            <button onClick={() => handleDelete(p.id)} style={styles.deleteBtn}>Delete</button>
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
    marginTop: "50px",
    fontSize: "24px"
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
    backgroundColor: "#27ae60",
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
    gap: "25px",
    marginTop: "30px"
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    padding: "15px",
    textAlign: "center",
    transition: "transform 0.2s ease"
  },
  image: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "6px",
    marginBottom: "10px"
  },
  cardTitle: {
    fontSize: "18px",
    margin: "10px 0 5px 0"
  },
  desc: {
    fontSize: "14px",
    color: "#555"
  },
  price: {
    fontWeight: "bold",
    color: "#2c3e50",
    margin: "10px 0"
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

export default AddProduct;
