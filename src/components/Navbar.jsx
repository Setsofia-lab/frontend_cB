// components/Navbar.jsx
import { useState } from 'react';
import styles from './Navbar.module.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <h1>Code Buddy</h1>
      </div>
      <div className={styles.menuIcon} onClick={() => setMenuOpen(!menuOpen)}>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <ul className={`${styles.navItems} ${menuOpen ? styles.menuOpen : ''}`}>
        <li><a href="#features">Features</a></li>
        <li><a href="#how-it-works">How It Works</a></li>
        <li><a href="#demo">Demo</a></li>
        <li><a href="#testimonials">Testimonials</a></li>
        <li><a href="#" className={styles.ctaButton}>Get Started</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;
