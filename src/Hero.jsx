import React, { useState, useEffect, useRef } from 'react';
import './style.css';
import { FiArrowRight } from 'react-icons/fi';

// Array of your hero image file paths from the public directory
const heroImages = [
    '/1.gif', // Replace with your actual image file names
    '/3.gif',
    '/4.gif',
    // Add more image paths here
];

const Hero = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const heroRef = useRef(null);

    // Handle image slideshow
    useEffect(() => {
        // Set up the interval to change image every few seconds
        const intervalId = setInterval(() => {
            setCurrentImageIndex(prevIndex =>
                (prevIndex + 1) % heroImages.length // Loop back to the start
            );
        }, 5000); // Change image every 5 seconds

        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [heroImages.length]);

    // Intersection Observer for animation on scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );

        if (heroRef.current) {
            observer.observe(heroRef.current);
        }

        return () => {
            if (heroRef.current) {
                observer.unobserve(heroRef.current);
            }
        };
    }, []);

    // Scroll to CTA section when button is clicked
    const scrollToCTA = () => {
        const ctaSection = document.getElementById('cta');
        if (ctaSection) {
            ctaSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section id="hero" ref={heroRef}>
            <div className="container">
                {/* Animated Elements with the hero */}
                <div className={`hero-slideshow ${isVisible ? 'animate-float' : ''}`}>
                    {heroImages.map((imageSrc, index) => (
                        <img
                            key={index}
                            src={imageSrc}
                            alt={`Hero Illustration ${index + 1}`}
                            className={`hero-slide-image ${index === currentImageIndex ? 'active' : ''}`}
                        />
                    ))}
                </div>

                {/* Hero Text Content with animation classes */}
                <div className="hero-content">
                    <h2 className={isVisible ? 'animate-fade-in' : ''}>
                        Elevate Coding Education with AI-Powered Evaluation
                    </h2>
                    {/* <p className={isVisible ? 'animate-fade-in delay-1' : ''}>
                        Code Buddy streamlines code assessment for higher education, providing nuanced feedback 
                        and saving instructors valuable time.
                    </p> */}
                    <div className={isVisible ? 'animate-fade-in delay-2' : ''}>
                        <button onClick={scrollToCTA} className="btn-primary">
                            Request a Demo <FiArrowRight style={{marginLeft: '5px', verticalAlign: 'middle'}} />
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Decorative elements */}
            <div className="hero-decoration-1"></div>
            <div className="hero-decoration-2"></div>
        </section>
    );
}

export default Hero;