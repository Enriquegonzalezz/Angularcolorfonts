import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
const TangramLoader = ({ isLoading, onSkip, userId }) => {
  const [visible, setVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [userColors, setUserColors] = useState(null);
  
  // Fetch user's default colors
  useEffect(() => {
    const fetchUserColors = async () => {
      if (!userId) {
        console.warn('=== DEBUG: No userId provided, using fallback colors ===');
        const fallbackColors = {
          color1: '#38999e',
          color2: '#CC8EC6',
          color3: '#E6E6FA',
          color4: '#FFFF99',
          color5: '#98FB98',
          primary: '#ffffff',
          secondary: 'rgba(0,0,0,0.8)',
          fontFamily: 'Arial'
        };
        setUserColors(fallbackColors);
        return;
      }

      try {
        console.log('=== DEBUG: Fetching colors for userId:', userId, '===');
        const response = await axios.get(`http://localhost:3000/videos/default-styles?userId=${userId}`);
        console.log('=== DEBUG: Response from backend:', response.data);
        
        const { styles } = response.data;
        if (styles) {
          console.log('=== DEBUG: Styles received:', styles);
          const userColorsObj = {
            color1: styles.color1 || '#38999e',
            color2: styles.color2 || '#CC8EC6',
            color3: styles.color3 || '#E6E6FA',
            color4: styles.color4 || '#FFFF99',
            color5: styles.color5 || '#98FB98',
            primary: styles.textColor || '#ffffff',
            secondary: styles.backgroundColor || 'rgba(0,0,0,0.8)',
            fontFamily: styles.fontFamily || 'Arial'
          };
          console.log('=== DEBUG: Setting userColors to:', userColorsObj);
          setUserColors(userColorsObj);
        } else {
          console.log('=== DEBUG: No styles found in response');
        }
      } catch (error) {
        console.error('Error loading colors for tangram:', error);
        // Usar colores por defecto
        const fallbackColors = {
          color1: '#38999e',
          color2: '#CC8EC6',
          color3: '#E6E6FA',
          color4: '#FFFF99',
          color5: '#98FB98',
          primary: '#ffffff',
          secondary: 'rgba(0,0,0,0.8)',
          fontFamily: 'Arial'
        };
        console.log('=== DEBUG: Using fallback colors:', fallbackColors);
        setUserColors(fallbackColors);
      }
    };
    
    fetchUserColors();
  }, [userId]);

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
    <div className="tangram-loader-overlay" style={{ backgroundColor: userColors?.secondary || 'rgba(0,0,0,0.8)' }}>
      <div className="tangram-loader-container">
        <Tangram userColors={userColors} />
        <div className="tangram-loader-controls">
          <div 
            className="tangram-loader-timer" 
            style={{ 
              color: userColors?.primary || '#ffffff',
              fontFamily: userColors?.fontFamily || 'Arial'
            }}
          >
            {timeLeft}s
          </div>
          <button 
            className="tangram-loader-skip-button" 
            onClick={handleSkip}
            style={{ 
              backgroundColor: userColors?.primary || '#4CAF50',
              fontFamily: userColors?.fontFamily || 'Arial'
            }}
          >
            Saltar animación
          </button>
        </div>
      </div>
    </div>
  );
};

export default TangramLoader;
