import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ListEmployee() {
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
    <div style={styles.container}>
      <h2>All Employees</h2>
      <input
        type="text"
        placeholder="Search employees..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={styles.search}
      />

      <div style={styles.grid}>
        {filteredEmployees.map(emp => (
          <div key={emp.id} style={styles.card}>
            <h4>{emp.emp_name}</h4>
            <p>{emp.emp_email}</p>
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
  }
};

export default ListEmployee;
