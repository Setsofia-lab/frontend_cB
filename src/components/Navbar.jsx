// components/Navbar.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Hide Get Started button on login page
  const showGetStarted = location.pathname !== '/login';

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/"><h1>Code Buddy</h1></Link>
      </div>
      <div className={styles.menuIcon} onClick={() => setMenuOpen(!menuOpen)}>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <ul className={`${styles.navItems} ${menuOpen ? styles.menuOpen : ''}`}>
        <li><Link to="/#features" onClick={() => setMenuOpen(false)}>Features</Link></li>
        <li><Link to="/#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</Link></li>
        <li><Link to="/#demo" onClick={() => setMenuOpen(false)}>Demo</Link></li>
        <li><Link to="/#testimonials" onClick={() => setMenuOpen(false)}>Testimonials</Link></li>
        {showGetStarted && <li><Link to="/login" className={styles.navLink} onClick={() => setMenuOpen(false)}>Student Login</Link></li>}
        {showGetStarted && <li><Link to="/login?role=instructor" className={styles.ctaButton} onClick={() => setMenuOpen(false)}>Instructor Portal</Link></li>} 
        {/* Instructor portal can also lead to /login, then redirect to /instructor or show specific options */}
      </ul>
    </nav>
  );
}

export default Navbar;
