
import React from 'react';
import { CodeIcon } from './icons/CodeIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <CodeIcon className="h-8 w-8 text-indigo-400" />
          <h1 className="text-xl font-bold text-gray-100">AI Website Development Tool</h1>
        </div>
      </div>
    </header>
  );
};
