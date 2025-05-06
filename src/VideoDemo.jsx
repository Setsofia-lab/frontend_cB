import React from 'react';
import './style.css';

const VideoDemo = ({ videoId }) => {
    // Correct YouTube embed URL format
    const youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}`;

    // Only render the iframe if a videoId is provided
    if (!videoId) {
        return null; // Or return a message asking for a video ID
    }

    return (
        <section id="video-demo">
            <div className="container">
                <h3>Watch a Demo of Code Buddy</h3>
                <div className="video-container">
                     <iframe
                        src={youtubeEmbedUrl} // Use the correctly formatted URL
                        title="Code Buddy Demo Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen>
                    </iframe>
                </div>
                {/* Keep or remove the paragraph as desired */}
                {/* <p>See how Code Buddy simplifies code evaluation and enhances student learning.</p> */}
            </div>
        </section>
    );
}

export default VideoDemo;