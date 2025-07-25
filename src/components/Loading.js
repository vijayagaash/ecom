import React from 'react';
import './Loading.css';

const Loading = ({ 
  message = "Loading...", 
  size = "medium", 
  fullScreen = false,
  overlay = false 
}) => {
  const containerClass = `loading-container ${size} ${fullScreen ? 'fullscreen' : ''} ${overlay ? 'overlay' : ''}`;
  
  return (
    <div className={containerClass}>
      <div className="loading-content">
        <div className="simple-loading-text">
          <p className="loading-message">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
