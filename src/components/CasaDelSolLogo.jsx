import React from 'react';
import logoImage from '../assets/LogoCasaDelSol2-980x493.png';

export const CasaDelSolLogo = ({ size = 'large' }) => {
  const sizes = {
    small: {
      width: 'w-24',
      height: 'h-12',
      textSize: 'text-sm'
    },
    medium: {
      width: 'w-48',
      height: 'h-24',
      textSize: 'text-base'
    },
    large: {
      width: 'w-80',
      height: 'h-40',
      textSize: 'text-lg'
    }
  };

  const currentSize = sizes[size];

  return (
    <div className="flex flex-col items-center text-center mb-8">
      <div className="mb-4">
        <img 
          src={logoImage} 
          alt="Casa del Sol - Centro de Bienestar" 
          className={`${currentSize.width} ${currentSize.height} object-contain mx-auto drop-shadow-lg`}
        />
      </div>
      
      <div className="text-center">
        <div className={`${currentSize.textSize} text-gray-600 font-medium`}>
          Centro de Bienestar
        </div>
      </div>
    </div>
  );
};