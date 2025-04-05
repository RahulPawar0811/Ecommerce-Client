// CursorRing.js
import React, { useEffect, useState } from 'react';
import './CursorRing.css';

const CursorRing = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // Track mouse position
  const handleMouseMove = (e) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  };

  // Add mouse move event listener when component mounts
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);

    // Clean up the event listener when the component is unmounted
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      className="cursor-ring"
      style={{
        left: `${cursorPosition.x}px`,
        top: `${cursorPosition.y}px`,
      }}
    />
  );
};

export default CursorRing;
