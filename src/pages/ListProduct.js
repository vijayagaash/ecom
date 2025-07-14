import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ListProduct() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get("http://localhost:8080/api/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <h2>All Products</h2>
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={styles.search}
      />

      <div style={styles.grid}>
        {filteredProducts.map(p => (
          <div key={p.id} style={styles.card}>
            <img src={p.url} alt={p.name} style={styles.image} />
            <h4>{p.name}</h4>
            <p>{p.description}</p>
            <p style={{ fontWeight: "bold" }}>₹{p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "30px", fontFamily: "Arial" },
  search: {
    width: "100%",
    padding: "10px",
    marginBottom: "20px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px"
  },
  card: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    textAlign: "center"
  },
  image: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    marginBottom: "10px",
    borderRadius: "6px"
  }
};

export default ListProduct;
