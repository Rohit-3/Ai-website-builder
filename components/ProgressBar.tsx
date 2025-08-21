
import React from 'react';

interface ProgressBarProps {
  percentage: number;
  message: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, message }) => {
  return (
    <div className="w-full bg-gray-700 rounded-full p-1">
      <div
        className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-xs font-medium text-blue-100 text-center p-1.5 leading-none rounded-full"
        style={{ width: `${percentage}%`, transition: 'width 0.5s ease-in-out' }}
      >
        <span className="relative z-10">{message} ({percentage.toFixed(0)}%)</span>
      </div>
    </div>
  );
};
