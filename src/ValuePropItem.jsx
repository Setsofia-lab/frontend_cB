import React from 'react';
import './style.css'; // Link to your CSS

const ValuePropItem = ({ icon: Icon, title, description }) => {
    // The 'icon' prop will be a React component from react-icons
    return (
        <div className="value-prop-item">
            {Icon && <Icon className="item-icon" />} {/* Render the icon if provided */}
            <h4>{title}</h4>
            <p>{description}</p>
        </div>
    );
}

export default ValuePropItem;