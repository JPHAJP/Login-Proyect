import React from 'react';

export const CasaDelSolLogo = ({ size = 'large' }) => {
  const sizeClasses = {
    small: 'logo-small',
    medium: 'logo-medium',
    large: 'logo-large'
  };

  return (
    <div className={`casa-sol-logo ${sizeClasses[size]}`}>
      <div className="logo-container">
        <div className="sun-rays">
          <div className="ray ray-1"></div>
          <div className="ray ray-2"></div>
          <div className="ray ray-3"></div>
          <div className="ray ray-4"></div>
          <div className="ray ray-5"></div>
          <div className="ray ray-6"></div>
          <div className="ray ray-7"></div>
          <div className="ray ray-8"></div>
        </div>
        <div className="sun-center">
          <div className="house-icon">🏠</div>
        </div>
      </div>
      <div className="logo-text">
        <div className="brand-name">Casa del Sol</div>
        <div className="brand-subtitle">Centro de Bienestar</div>
      </div>
    </div>
  );
};