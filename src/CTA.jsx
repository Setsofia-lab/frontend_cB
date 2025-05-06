import React, { useState, useEffect } from 'react';
import './style.css';

const CTA = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [hoverButton, setHoverButton] = useState(null);
    
    // Animate on scroll into view
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.3 });
        
        const ctaSection = document.getElementById("cta");
        if (ctaSection) observer.observe(ctaSection);
        
        return () => {
            if (ctaSection) observer.unobserve(ctaSection);
        };
    }, []);

    return (
        <section id="cta" className={`${isVisible ? 'fade-in' : ''}`}>
            <div className="container">
                <h3 className={isVisible ? 'slide-up' : ''}>Ready to Transform Code Evaluation?</h3>
                <p className={isVisible ? 'slide-up delay-1' : ''}>
                    Discover how Code Buddy can benefit your institution and students.
                </p>
                <div className={`button-container ${isVisible ? 'slide-up delay-2' : ''}`}>
                    <a 
                        href="#" 
                        className="btn-primary pulse"
                        onMouseEnter={() => setHoverButton('demo')}
                        onMouseLeave={() => setHoverButton(null)}
                    >
                        {hoverButton === 'demo' ? 'See It In Action' : 'Request a Demo'}
                    </a>
                    <a 
                        href="#" 
                        className="btn-secondary"
                        onMouseEnter={() => setHoverButton('learn')}
                        onMouseLeave={() => setHoverButton(null)}
                    >
                        {hoverButton === 'learn' ? 'Explore Features' : 'Learn More'}
                    </a>
                </div>
            </div>
        </section>
    );
}

export default CTA;