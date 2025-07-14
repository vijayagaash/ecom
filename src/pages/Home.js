import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>E-Com Store</h1>
        <nav style={styles.nav}>
          <button onClick={() => navigate("/customer-auth")} style={styles.navButton}>Shop</button>
          <button onClick={() => navigate("/admin")} style={styles.navButton}>Admin</button>
        </nav>
      </header>

      <section style={styles.hero}>
        <h2 style={styles.title}>Welcome to the Ecom Store!</h2>
        <p style={styles.subtitle}>Browse products, enjoy fast delivery & great deals.</p>
        <button onClick={() => navigate("/customer-auth")} style={styles.cta}>Start Shopping</button>
      </section>

      <footer style={styles.footer}>
        <p>&copy; {new Date().getFullYear()} E-Com Store. All rights reserved.</p>
      </footer>
    </div>
  );
}

const styles = {
  container: { fontFamily: "Arial, sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column" },
  header: { display: "flex", justifyContent: "space-between", padding: "20px", background: "#ffffff", color: "black" },
  logo: { margin: 0 },
  nav: { display: "flex", gap: "10px" },
  navButton: { background: "black", color: "#ffffff", border: "none", padding: "10px 15px", borderRadius: "4px", cursor: "pointer" },
  hero: { flex: 1, textAlign: "center", padding: "60px 20px", background: "#f5f5f5", backgroundImage: "url('https://wallpapercat.com/w/full/5/c/0/2117697-3840x2160-desktop-4k-dark-wallpaper.jpg')", backgroundSize: "cover", color: "#ffffff", backgroundPosition: "center"},
  title: { fontSize: "2.5rem", marginBottom: "20px" },
  subtitle: { fontSize: "1.2rem", marginBottom: "30px" },
  cta: { padding: "12px 24px", fontSize: "16px", background: "#ffffff", color: "black", border: "none", borderRadius: "6px", cursor: "pointer" },
  footer: { background: "#ffffff", color: "#000000", textAlign: "center", padding: "20px" }
};

export default Home;
