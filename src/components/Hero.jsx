

import styles from './Hero.module.css';
import { useState, useEffect } from 'react';

function Hero() {
    const images = [
        '/1.png',
        '/3.png',
        '/4.png'

      ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 6000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1>let's code, buddy!</h1>
        <p>Help students truly understand their code through conversational feedback</p>
        <div className={styles.buttonGroup}>
          <button className={styles.primaryButton}>Get Started</button>
          <button className={styles.secondaryButton}>Watch Demo</button>
        </div>
      </div>
      <div className={styles.heroImage}>
        <img
          className={styles.placeholderImage}
          src={images[currentImageIndex]}
          alt={`Slideshow image ${currentImageIndex + 1}`}
        />
      </div>
    </section>
  );
}

export default Hero;

// '/fearof student use AI.png',
// '/student use AI for code.png',
// '/codebuddy help student understand their code.png',
// '/codebuddy help profs evalutate student.png'