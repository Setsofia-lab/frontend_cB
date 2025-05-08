// components/Testimonials.jsx
import { useState } from 'react';
import styles from './Testimonials.module.css';

function Testimonials() {
  const testimonials = [
    {
      quote: "Code Buddy has completely transformed how I teach programming courses. My students show deeper understanding of concepts.",
      name: "Dr. Sarah Johnson",
      title: "Computer Science Professor"
    },
    {
      quote: "The interactive feedback system helped me understand my programming mistakes far better than traditional grading.",
      name: "Alex Chen",
      title: "CS Student"
    },
    {
      quote: "Our department has seen a 40% increase in student satisfaction since implementing Code Buddy.",
      name: "Mark Wilson",
      title: "Department Chair"
    }
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className={styles.testimonials}>
      <h2>What People Are Saying</h2>
      <div className={styles.testimonialContainer}>
        <button onClick={prevTestimonial} className={styles.navButton}>←</button>
        <div className={styles.testimonialCard}>
          <p className={styles.quote}>"{testimonials[currentTestimonial].quote}"</p>
          <p className={styles.author}>{testimonials[currentTestimonial].name}</p>
          <p className={styles.title}>{testimonials[currentTestimonial].title}</p>
        </div>
        <button onClick={nextTestimonial} className={styles.navButton}>→</button>
      </div>
      <div className={styles.indicators}>
        {testimonials.map((_, index) => (
          <span 
            key={index} 
            className={`${styles.indicator} ${index === currentTestimonial ? styles.active : ''}`}
            onClick={() => setCurrentTestimonial(index)}
          ></span>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;