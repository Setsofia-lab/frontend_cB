// components/Features.jsx
import styles from './Features.module.css';

function Features() {
  const features = [
    {
      icon: '💬',
      title: 'Conversational Feedback',
      description: 'Interactive sessions that help students understand code deeply'
    },
    {
      icon: '⏱️',
      title: 'Time Saving',
      description: 'Instructors spend less time on evaluating students'
    },
    {
      icon: '🧠',
      title: 'Deep Understanding',
      description: 'Promote comprehensive learning through constructive and personalized feedback '
    },
    {
      icon: '🔄',
      title: 'Iterative Learning',
      description: 'Students improve through multiple feedback cycles'
    }
  ];

  return (
    <section id="features" className={styles.features}>
      <h2>Transforming Code Education</h2>
      <div className={styles.featureGrid}>
        {features.map((feature, index) => (
          <div key={index} className={styles.featureCard}>
            <div className={styles.featureIcon}>{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;