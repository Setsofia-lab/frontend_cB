// components/CallToAction.jsx
import styles from './CTA.module.css';

function CTA() {
  return (
    <section className={styles.callToAction}>
      <div className={styles.ctaBox}>
        <h2>Ready to Transform Code Education?</h2>
        <p>Join the growing community of educators and students using Code Buddy</p>
        <button className={styles.ctaButton}>Get Started Today</button>
      </div>
    </section>
  );
}

export default CTA;