import React, { useState } from 'react';
import './style.css';

const FeatureItem = ({ imageSrc, title, description }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <div 
            className={`feature-item ${isHovered ? 'feature-hover' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="feature-image-container">
                {imageSrc && (
                    <img 
                        src={imageSrc} 
                        alt={`${title} Illustration`} 
                        className={`item-image ${isHovered ? 'image-zoom' : ''}`} 
                    />
                )}
                <div className={`image-overlay ${isHovered ? 'overlay-show' : ''}`}></div>
            </div>
            
            <div className="feature-content">
                <h4>{title}</h4>
                <p className={isHovered ? 'description-expanded' : ''}>{description}</p>
            </div>
            
            {isHovered && (
                <div className="feature-details">
                    <span className="learn-more">Learn more →</span>
                </div>
            )}
        </div>
    );
}

export default FeatureItem;