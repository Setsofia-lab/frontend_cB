import React, { useState, useEffect, useRef } from 'react';
import './style.css';

// Value props data
const valueProps = [
    {
        title: "Save Time",
        description: "Automate repetitive grading tasks and provide instant feedback to students"
    },
    {
        title: "Enhance Learning",
        description: "Detailed, consistent feedback helps students improve their coding skills faster"
    },
    {
        title: "Maintain Standards",
        description: "Evaluate code against consistent criteria for objectivity and fairness"
    }
];

const ProblemSolution = () => {
    // State for content transition
    const [activeContent, setActiveContent] = useState('problem');
    const [isAnimating, setIsAnimating] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const sectionRef = useRef(null);
    
    // Animate on scroll into view
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.3 });
        
        if (sectionRef.current) observer.observe(sectionRef.current);
        
        return () => {
            if (sectionRef.current) observer.unobserve(sectionRef.current);
        };
    }, []);
    
    // Auto toggle between problem and solution
    useEffect(() => {
        if (!isVisible || hasUserInteracted) return;
        
        const toggleTimer = setTimeout(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setActiveContent(prev => prev === 'problem' ? 'solution' : 'problem');
                setIsAnimating(false);
            }, 500); // Time for fade-out animation
        }, 8000); // Display each content for 8 seconds
        
        return () => clearTimeout(toggleTimer);
    }, [activeContent, isVisible, hasUserInteracted]);
    
    // Handle manual toggle
    const handleToggle = () => {
        if (isAnimating) return;
        
        setHasUserInteracted(true);
        setIsAnimating(true);
        
        setTimeout(() => {
            setActiveContent(prev => prev === 'problem' ? 'solution' : 'problem');
            setIsAnimating(false);
        }, 500);
    };

    return (
        <section 
            id="problem-solution-section" 
            ref={sectionRef}
            className={isVisible ? 'section-visible' : ''}
        >
            <div className="container">
                {/* Problem Content Block */}
                <div 
                    className={`problem-content content-block ${
                        activeContent === 'problem' ? 'active' : ''
                    } ${isAnimating && activeContent === 'problem' ? 'fade-out' : ''}`}
                >
                    <img 
                        src="/gradingcode.png" 
                        alt="Problem Illustration" 
                        className={`section-illustration ${isVisible ? 'image-float' : ''}`}
                    />

                    <h3 className={isVisible ? 'title-animate' : ''}>The Challenge of Code Grading</h3>
                    
                    <div className={`problem-points ${isVisible ? 'fade-in-up' : ''}`}>
                        <div className="problem-point">
                            <span className="point-number">1</span>
                            <p>Grading code is time-consuming</p>
                        </div>
                        <div className="problem-point delay-1">
                            <span className="point-number">2</span>
                            <p>Inconsistent evaluation standards</p>
                        </div>
                        <div className="problem-point delay-2">
                            <span className="point-number">3</span>
                            <p>Limited personalized feedback</p>
                        </div>
                    </div>
                </div>

                {/* Solution Content Block */}
                <div 
                    className={`solution-content content-block ${
                        activeContent === 'solution' ? 'active' : ''
                    } ${isAnimating && activeContent === 'solution' ? 'fade-out' : ''}`}
                >
                    <img 
                        src="/3.png" 
                        alt="Solution Illustration" 
                        className={`section-illustration ${isVisible ? 'image-float' : ''}`}
                    />

                    <h3 className={isVisible ? 'title-animate' : ''}>Code Buddy: The Intelligent Solution</h3>

                    <div className="value-props">
                        {valueProps.map((prop, index) => (
                            <div 
                                key={index} 
                                className={`value-prop-item ${isVisible ? `fade-in-up delay-${index}` : ''}`}
                            >
                                <h4>{prop.title}</h4>
                                <p>{prop.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Toggle Button */}
                <button 
                    className={`toggle-content-btn ${isAnimating ? 'btn-disabled' : ''}`}
                    onClick={handleToggle}
                    disabled={isAnimating}
                >
                    {activeContent === 'problem' ? 'See the Solution' : 'Review the Problem'}
                </button>
                
                {/* Progress Indicator */}
                <div className="content-progress">
                    <div 
                        className={`progress-dot ${activeContent === 'problem' ? 'active' : ''}`}
                        onClick={() => !isAnimating && (setActiveContent('problem'), setHasUserInteracted(true))}
                    />
                    <div 
                        className={`progress-dot ${activeContent === 'solution' ? 'active' : ''}`}
                        onClick={() => !isAnimating && (setActiveContent('solution'), setHasUserInteracted(true))}
                    />
                </div>
            </div>
        </section>
    );
}

export default ProblemSolution;