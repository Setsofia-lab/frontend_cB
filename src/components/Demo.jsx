import styles from './Demo.module.css';

function Demo() {
  return (
    <section id="demo" className={styles.demo}>
      <h2>See Code Buddy in Action</h2>
      <div className={styles.videoContainer}>
        {/* Embed YouTube video */}
        <iframe
          className={styles.youtubeVideo}
          width="660"
          height="415"
          src="https://www.youtube.com/embed/X0f5K_4rJ_I"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <div className={styles.demoDescription}>
        <p>Watch how Code Buddy transforms the learning experience for both students and instructors.</p>
        <button className={styles.learnMoreButton}>Learn More</button>
      </div>
    </section>
  );
}

export default Demo;