import React from 'react';
import { Link } from 'react-router-dom';
import './CSS/Home.css';
import homeImage from '../assets/community.jpg';

const Home = () => {
  return (
    <div className="home-container">
      <nav className="home-navbar">
        <h1>CasaConnect</h1>
        <div>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </div>
      </nav>
      <header className="hero">
        <img src={homeImage} alt="Community" />
        <div className="home-hero-text">
          <h2>Connect with Your Apartment Community</h2>
          <p>Stay informed. Report issues. Celebrate events together.</p>
          <Link to="/signup" className="home-cta-button">Get Started</Link>
        </div>
      </header>
    </div>
  );
};

export default Home;