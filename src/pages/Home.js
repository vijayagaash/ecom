import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1 className="logo">E-Com Store</h1>
          <nav className="home-nav">
            <button onClick={() => navigate("/customer-auth")} className="nav-button shop-btn">
              Shop Now
            </button>
            <button onClick={() => navigate("/admin")} className="nav-button admin-btn">
              Admin
            </button>
          </nav>
        </div>
      </header>

      <main className="home-main">
        <section className="hero-section">
          <div className="hero-content">
            <h2 className="hero-title">Welcome to E-Com Store</h2>
            <p className="hero-subtitle">
              Discover amazing products with fast delivery and unbeatable prices. 
              Your one-stop shop for everything you need.
            </p>
            <div className="hero-actions">
              <button onClick={() => navigate("/customer-auth")} className="cta-button primary">
                Start Shopping
              </button>
              <button onClick={() => navigate("/shop")} className="cta-button secondary">
                Browse Products
              </button>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="features-container">
            <h3>Why Choose Us?</h3>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🚚</div>
                <h4>Fast Delivery</h4>
                <p>Quick and reliable shipping to your doorstep</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💳</div>
                <h4>Secure Payment</h4>
                <p>Safe and encrypted payment processing</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔄</div>
                <h4>Easy Returns</h4>
                <p>Hassle-free 30-day return policy</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <h4>Quality Products</h4>
                <p>Carefully curated high-quality items</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} E-Com Store. All rights reserved.</p>
          <div className="footer-links">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact Us</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
