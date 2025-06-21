import React, { useRef } from 'react';
import './homebutton.css';

function HomeButton({ onHome }) {
  const timeoutRef = useRef(null);

  const startPress = () => {
    timeoutRef.current = setTimeout(() => {
      onHome(); // Navigate home after 1.5 seconds
    }, 1500);
  };

  const cancelPress = () => {
    clearTimeout(timeoutRef.current);
  };

  return (
    <div
      className="home-button"
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
    >
      🏠
    </div>
  );
}

export default HomeButton;
