// components/HowItWorks.jsx
import styles from './HowItWorks.module.css';

function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Submit Code',
      description: 'Students upload their code assignments to the codeBuddy'
    },
    {
      number: '02',
      title: 'Analyze',
      description: 'codeBuddy performs initial analysis on the submitted code'
    },
    {
      number: '03',
      title: 'Interactive Feedback',
      description: 'codeBudyy guide students through conversational sessions on their code and refine their understanding through feedback received'
    },
    // {
    //   number: '04',
    //   title: 'Iterative Improvement',
    //   description: 'Students refine their understanding through feedback received'
    // }
  ];

  return (
    <section id="how-it-works" className={styles.howItWorks}>
      <h2>How Code Buddy Works</h2>
      <div className={styles.stepsContainer}>
        {steps.map((step, index) => (
          <div key={index} className={styles.step}>
            <div className={styles.stepNumber}>{step.number}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;