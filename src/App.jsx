import React from 'react';
import Header from './Header.jsx'; // <-- Updated
import Hero from './Hero.jsx'; // <-- Updated
import ProblemSolution from './ProblemSolution.jsx'; // <-- Updated
import Features from './Features.jsx'; // <-- Updated
import VideoDemo from './VideoDemo.jsx'; // <-- Updated
import CTA from './CTA.jsx'; // <-- Updated
import Footer from './Footer.jsx'; // <-- Updated
import './style.css'; // This stays .css

function App() {
  // Replace 'YOUR_YOUTUBE_VIDEO_ID' with the actual ID of your demo video
  const demoVideoId = 'v9kr2Hor8ms'; // Example: 'dQw4w9WgXcQ'

  return (
    <div className="App">
      <Header />
      <Hero />
      <ProblemSolution/>
      <Features />
      <VideoDemo videoId={demoVideoId} /> {/* Use the VideoDemo component */}
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
