import React from 'react';
import './Tangram.css';

const Tangram = () => {
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
