import React, { useState, useEffect } from 'react';
import Tangram from '../../tangram/Tangram';
import './TangramLoader.css';

/**
 * TangramLoader component that displays a Tangram animation when content is loading
 * The animation lasts for 15 seconds unless skipped by the user
 * 
 * @param {Object} props
 * @param {boolean} props.isLoading - Whether the content is loading
 * @param {function} props.onSkip - Optional callback when animation is skipped
 * @returns {JSX.Element|null}
 */
const TangramLoader = ({ isLoading, onSkip }) => {
  const [visible, setVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  
  // Handle visibility based on loading state
  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setTimeLeft(15);
    }
  }, [isLoading]);

  // Handle countdown timer
  useEffect(() => {
    let timer;
    
    if (visible && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setVisible(false);
      if (onSkip) onSkip();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible, timeLeft, onSkip]);

  // Handle skip button click
  const handleSkip = () => {
    setVisible(false);
    if (onSkip) onSkip();
  };

  if (!visible) return null;

  return (
    <div className="tangram-loader-overlay">
      <div className="tangram-loader-container">
        <Tangram />
        <div className="tangram-loader-controls">
          <div className="tangram-loader-timer">{timeLeft}s</div>
          <button className="tangram-loader-skip-button" onClick={handleSkip}>
            Saltar animación
          </button>
        </div>
      </div>
    </div>
  );
};

export default TangramLoader;
