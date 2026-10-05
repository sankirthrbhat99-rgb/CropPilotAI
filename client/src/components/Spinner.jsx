import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 'md', text = '', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-4 ${className}`}>
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-emerald-600 animate-spin`} />
      {text && (
        <p className="text-sm font-medium text-slate-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default Spinner;
