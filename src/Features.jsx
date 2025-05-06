import React, { useState, useEffect, useRef } from 'react';
import './style.css';

// Array of feature data
const featuresData = [
    {
        imageSrc: "/aicodeanalysis.png",
        title: "AI Code Analysis",
        description: "Utilize advanced AI models to evaluate code based on multiple criteria including correctness, efficiency, and style."
    },
    {
        imageSrc: "/detailedreport.png",
        title: "Detailed Feedback Reports",
        description: "Generate comprehensive feedback for students, highlighting specific areas for improvement with actionable suggestions."
    },
    {
        imageSrc: "/instructordashboard.png",
        title: "Instructor Dashboard",
        description: "Get a complete overview of student performance and manage assignments efficiently with intuitive visualizations."
    },
    {
        imageSrc: "/academicintegrity.png",
        title: "Academic Integrity Support",
        description: "Sophisticated tools to help identify potential academic integrity concerns while supporting the learning process."
    },
];

const Features = () => {
    const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [direction, setDirection] = useState('next');
    const featuresRef = useRef(null);
    
    // Animation on scroll
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.2 });
        
        if (featuresRef.current) observer.observe(featuresRef.current);
        
        return () => {
            if (featuresRef.current) observer.unobserve(featuresRef.current);
        };
    }, []);

    // Auto-rotate features
    useEffect(() => {
        if (isPaused) return;
        
        const intervalId = setInterval(() => {
            if (direction === 'next') {
                setCurrentFeatureIndex(prevIndex => (prevIndex + 1) % featuresData.length);
            } else {
                setCurrentFeatureIndex(prevIndex => 
                    prevIndex === 0 ? featuresData.length - 1 : prevIndex - 1
                );
            }
        }, 6000);

        return () => clearInterval(intervalId);
    }, [isPaused, direction, featuresData.length]);

    const handleNavClick = (index) => {
        setCurrentFeatureIndex(index);
        setIsPaused(true);
        
        // Resume auto-rotation after pause
        setTimeout(() => setIsPaused(false), 10000);
    };

    const handlePrevClick = () => {
        setDirection('prev');
        setCurrentFeatureIndex(prevIndex => 
            prevIndex === 0 ? featuresData.length - 1 : prevIndex - 1
        );
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 10000);
    };

    const handleNextClick = () => {
        setDirection('next');
        setCurrentFeatureIndex(prevIndex => (prevIndex + 1) % featuresData.length);
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 10000);
    };

    return (
        <section id="features" ref={featuresRef} className={isVisible ? 'section-visible' : ''}>
            <div className="container">
                <h3 className={isVisible ? 'title-animate' : ''}>Key Features</h3>
                
                {/* Carousel Container */}
                <div 
                    className="features-carousel"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Navigation Arrows */}
                    <button 
                        className="carousel-arrow carousel-prev" 
                        onClick={handlePrevClick}
                        aria-label="Previous feature"
                    >
                        &lsaquo;
                    </button>
                    
                    {/* Features */}
                    {featuresData.map((feature, index) => (
                        <div
                            key={index}
                            className={`feature-slide ${index === currentFeatureIndex ? 'active' : ''} ${
                                // Add sliding directions
                                index === currentFeatureIndex ? 'slide-in' : 
                                ((currentFeatureIndex === 0 && index === featuresData.length - 1) || 
                                 index === currentFeatureIndex - 1) ? 'slide-out-left' : 'slide-out-right'
                            }`}
                        >
                            <img
                                src={feature.imageSrc}
                                alt={`${feature.title} Illustration`}
                                className="feature-slide-image"
                            />
                            <div className="feature-slide-content">
                                <h4>{feature.title}</h4>
                                <p>{feature.description}</p>
                            </div>
                        </div>
                    ))}
                    
                    {/* Navigation Arrows */}
                    <button 
                        className="carousel-arrow carousel-next" 
                        onClick={handleNextClick}
                        aria-label="Next feature"
                    >
                        &rsaquo;
                    </button>
                    
                    {/* Indicator Dots */}
                    <div className="carousel-indicators">
                        {featuresData.map((_, index) => (
                            <button
                                key={index}
                                className={`carousel-dot ${index === currentFeatureIndex ? 'active' : ''}`}
                                onClick={() => handleNavClick(index)}
                                aria-label={`Feature ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Features;