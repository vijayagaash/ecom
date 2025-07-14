import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart } from 'chart.js/auto';

function AdminDashboard() {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const pieChartRef = useRef(null);

  const [productCount, setProductCount] = useState(0);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/products").then((res) => {
      setProducts(res.data);
      setProductCount(res.data.length);
      renderBarChart(res.data);
      renderPieChart(res.data);
    });

    axios.get("http://localhost:8080/api/employees").then((res) => {
      setEmployeeCount(res.data.length);
    });
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

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div style={styles.dashboard}>
      <nav style={styles.navbar}>
        <h2 style={styles.logo}>Admin Panel</h2>
        <div style={styles.navItems}>
          <Dropdown
            label="Product"
            items={[
              { label: 'Add Product', path: '/add-product' },
              { label: 'List Products', path: '/list-product' },
            ]}
            onNavigate={handleNavigate}
          />

          <Dropdown
            label="Employee"
            items={[
              { label: 'Add Employee', path: '/add-employee' },
              { label: 'List Employees', path: '/list-employee' },
            ]}
            onNavigate={handleNavigate}
          />

          <Dropdown
            label="Customer"
            items={[
              { label: 'List Customers', path: '/view-customer' },
            ]}
            onNavigate={handleNavigate}
          />
        </div>
      </nav>

      <section style={styles.statsSection}>
        <div style={styles.card}>
          <h3>Products</h3>
          <p style={styles.count}>{productCount}</p>
        </div>
        <div style={styles.card}>
          <h3>Employees</h3>
          <p style={styles.count}>{employeeCount}</p>
        </div>
      </section>

      <section style={styles.chart}>
        <h3>Product Price Overview (Bar Chart)</h3>
        <canvas ref={chartRef} height="200"></canvas>
      </section>

      <section style={styles.chart}>
        <h3>Product Category Overview (Pie Chart)</h3>
        <canvas ref={pieChartRef} height="200"></canvas>
      </section>
    </div>
  );
}

const Dropdown = ({ label, items, onNavigate }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={styles.dropdown}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span style={styles.dropdownLabel}>{label}</span>
      {open && (
        <div style={styles.dropdownContent}>
          {items.map((item, index) => (
            <div
              key={index}
              style={styles.dropdownItem}
              onClick={() => {
                setOpen(false);
                onNavigate(item.path);
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  dashboard: {
    fontFamily: "'Segoe UI', sans-serif",
    backgroundColor: '#f4f6f8',
    minHeight: '100vh',
    padding: '20px',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2d3436',
    padding: '15px 25px',
    borderRadius: '10px',
    marginBottom: '30px',
    color: 'white',
  },
  logo: {
    margin: 0,
    fontSize: '22px',
  },
  navItems: {
    display: 'flex',
    gap: '25px',
  },
  dropdown: {
    position: 'relative',
    cursor: 'pointer',
  },
  dropdownLabel: {
    fontWeight: 'bold',
    fontSize: '16px',
    padding: '10px',
    display: 'inline-block',
  },
  dropdownContent: {
    position: 'absolute',
    top: '35px',
    left: '0',
    backgroundColor: '#fff',
    color: '#333',
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    zIndex: 1000,
    minWidth: '160px',
  },
  dropdownItem: {
    padding: '10px 15px',
    cursor: 'pointer',
    borderBottom: '1px solid #eee',
    backgroundColor: 'white',
  },
  statsSection: {
    display: 'flex',
    gap: '20px',
    marginBottom: '40px',
    flexWrap: 'wrap',
  },
  card: {
    flex: '1',
    minWidth: '200px',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  count: {
    fontSize: '32px',
    color: '#00b894',
    fontWeight: 'bold',
  },
  chart: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
};

export default AdminDashboard;
