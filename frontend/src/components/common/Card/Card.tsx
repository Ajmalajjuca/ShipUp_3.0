import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
}) => {
  const baseStyles = 'bg-white rounded-lg shadow-sm border border-gray-100';
  
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const hoverStyles = hover ? 'hover:shadow-md transition-shadow duration-300 cursor-pointer' : '';
  const clickableStyles = onClick ? 'cursor-pointer' : '';

  const combinedClassName = `${baseStyles} ${paddingStyles[padding]} ${hoverStyles} ${clickableStyles} ${className}`;

  return (
    <div className={combinedClassName} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
