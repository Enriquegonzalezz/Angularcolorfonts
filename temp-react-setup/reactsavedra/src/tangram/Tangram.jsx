import React, { useEffect } from 'react';
import './Tangram.css';

const Tangram = ({ userColors }) => {
  // Apply user colors to tangram elements
  useEffect(() => {
    console.log('=== DEBUG: Tangram useEffect triggered with userColors:', userColors);
    if (userColors) {
      // Generate color palette from user's primary colors
      const colors = generateTangramColors(userColors);
      console.log('=== DEBUG: Generated colors for tangram:', colors);
      applyTangramColors(colors);
    }
  }, [userColors]);

  // Use the 5 default colors directly from the database
  const generateTangramColors = (userColors) => {
    return {
      color1: userColors.color1 || '#38999e',
      color2: userColors.color2 || '#CC8EC6', 
      color3: userColors.color3 || '#E6E6FA',
      color4: userColors.color4 || '#FFFF99',
      color5: userColors.color5 || '#98FB98',
      color6: userColors.color1 || '#38999e', // Reutilizar color1 para el 6to elemento
      color7: getDarkerVersion(userColors.color1 || '#38999e'), // Versión más oscura del color1
    };
  };

  // Get darker version of a color
  const getDarkerVersion = (color) => {
    if (color.startsWith('#')) {
      const hsl = hexToHsl(color);
      return adjustBrightness(hsl, -30);
    }
    return color;
  };

  // Convert hex to HSL
  const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  // Adjust hue
  const adjustHue = (hsl, degrees) => {
    const newHue = (hsl[0] + degrees) % 360;
    return `hsl(${newHue}, ${hsl[1]}%, ${hsl[2]}%)`;
  };

  // Adjust brightness
  const adjustBrightness = (hsl, amount) => {
    const newLightness = Math.max(0, Math.min(100, hsl[2] + amount));
    return `hsl(${hsl[0]}, ${hsl[1]}%, ${newLightness}%)`;
  };

  // Apply colors to tangram elements
  const applyTangramColors = (colors) => {
    const style = document.createElement('style');
    style.id = 'tangram-dynamic-colors';
    
    // Remove existing dynamic styles
    const existing = document.getElementById('tangram-dynamic-colors');
    if (existing) existing.remove();
    
    style.textContent = `
      .triangle-container-first .triangle,
      .triangle-container-first .triangle-back {
        background-color: ${colors.color1} !important;
        border-color: transparent transparent ${colors.color1} transparent !important;
      }
      .triangle-container-first .edge1,
      .triangle-container-first .edge2,
      .triangle-container-first .edge3 {
        background-color: ${colors.color7} !important;
      }
      
      .triangle-container-second .triangle,
      .triangle-container-second .triangle-back {
        background-color: ${colors.color2} !important;
        border-color: transparent transparent ${colors.color2} transparent !important;
      }
      .triangle-container-second .edge1,
      .triangle-container-second .edge2,
      .triangle-container-second .edge3 {
        background-color: ${getDarkerVersion(colors.color2)} !important;
      }
      
      .cube-container .cube,
      .cube-container .cube-back {
        background-color: ${colors.color3} !important;
      }
      .cube-container .edge1,
      .cube-container .edge2,
      .cube-container .edge3,
      .cube-container .edge4 {
        background-color: ${getDarkerVersion(colors.color3)} !important;
      }
      
      .paralelogram-container .paralelogram-part .triangle,
      .paralelogram-container .paralelogram-part .triangle-back {
        background-color: ${colors.color4} !important;
        border-color: transparent transparent ${colors.color4} transparent !important;
      }
      .paralelogram-container .paralelogram-part .edge1,
      .paralelogram-container .paralelogram-part .edge2,
      .paralelogram-container .paralelogram-part .edge3 {
        background-color: ${getDarkerVersion(colors.color4)} !important;
      }
      
      .double-container .triangle,
      .double-container .triangle-back {
        background-color: ${colors.color5} !important;
        border-color: transparent transparent ${colors.color5} transparent !important;
      }
      .double-container .edge1,
      .double-container .edge2,
      .double-container .edge3 {
        background-color: ${getDarkerVersion(colors.color5)} !important;
      }
      
      .large-container-first .triangle,
      .large-container-first .triangle-back {
        background-color: ${colors.color1} !important;
        border-color: transparent transparent ${colors.color1} transparent !important;
      }
      .large-container-first .edge1,
      .large-container-first .edge2,
      .large-container-first .edge3 {
        background-color: ${colors.color7} !important;
      }
      
      .large-container-second .triangle,
      .large-container-second .triangle-back {
        background-color: ${colors.color2} !important;
        border-color: transparent transparent ${colors.color2} transparent !important;
      }
      .large-container-second .edge1,
      .large-container-second .edge2,
      .large-container-second .edge3 {
        background-color: ${getDarkerVersion(colors.color2)} !important;
      }
    `;
    
    document.head.appendChild(style);
  };

  return (
    <div className="perspective-container">
      <div className="triangle-container-first">
        <div className="triangle"></div>
        <div className="triangle-back absolute top-0"></div>
        <div className="absolute edge1"></div>
        <div className="absolute edge2"></div>
        <div className="absolute edge3"></div>
      </div>
      
      <div className="triangle-container-second">
        <div className="triangle"></div>
        <div className="triangle-back absolute top-0"></div>
        <div className="absolute edge1"></div>
        <div className="absolute edge2"></div>
        <div className="absolute edge3"></div>
      </div>
       
      <div className="cube-container">
        <div className="cube"></div>
        <div className="cube-back absolute top-0"></div>
        <div className="absolute edge1"></div>
        <div className="absolute edge2"></div>
        <div className="absolute edge3"></div>
        <div className="absolute edge4"></div>
      </div>
     
      <div className="paralelogram-container">
        <div className="paralelogram-part p-first">
          <div className="triangle"></div>
          <div className="triangle-back absolute top-0"></div>
          <div className="absolute edge1"></div>
          <div className="absolute edge2"></div>
          <div className="absolute edge3"></div>
        </div>
        <div className="paralelogram-part absolute p-second">
          <div className="triangle"></div>
          <div className="triangle-back absolute top-0"></div>
          <div className="absolute edge1"></div>
          <div className="absolute edge2"></div>
          <div className="absolute edge3"></div>
        </div>
      </div>
       
      <div className="double-container">
        <div className="triangle"></div>
        <div className="triangle-back absolute top-0"></div>
        <div className="absolute edge1"></div>
        <div className="absolute edge2"></div>
        <div className="absolute edge3"></div>
      </div>     

      <div className="large-container-first">
        <div className="triangle"></div>
        <div className="triangle-back absolute top-0"></div>
        <div className="absolute edge1"></div>
        <div className="absolute edge2"></div>
        <div className="absolute edge3"></div>
      </div>

      <div className="large-container-second">
        <div className="triangle"></div>
        <div className="triangle-back absolute top-0"></div>
        <div className="absolute edge1"></div>
        <div className="absolute edge2"></div>
        <div className="absolute edge3"></div>
      </div>
    </div>
  );
};

export default Tangram;
