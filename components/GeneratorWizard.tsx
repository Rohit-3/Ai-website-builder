import React, { useState } from 'react';
import type { GenerationParams } from '../types';

interface GeneratorWizardProps {
  onSubmit: (params: GenerationParams) => void;
  isLoading: boolean;
}

export const GeneratorWizard: React.FC<GeneratorWizardProps> = ({ onSubmit, isLoading }) => {
  const [step, setStep] = useState(1);

  // Form State
  const [topic, setTopic] = useState('');
  const [domain, setDomain] = useState('example.com');
  const [style, setStyle] = useState('');


  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (step === 1 && (!topic || !domain)) return;
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ topic, domain, style });
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {step === 1 && (
        <div className="animate-fade-in">
          <h3 className="text-xl font-semibold text-center mb-6">Step 1: The Foundation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-2">
                Topic / Industry
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Sustainable Urban Farming"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-200"
                required
              />
            </div>
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-300 mb-2">
                Domain Name
              </label>
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g., urbanfarms.com"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-200"
                required
              />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <h3 className="text-xl font-semibold text-center mb-6">Step 2: Aesthetics & Style</h3>
          <div>
            <label htmlFor="style" className="block text-sm font-medium text-gray-300 mb-2 text-center">
              Describe the look and feel you're going for. (Optional)
            </label>
            <textarea
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              rows={3}
              placeholder="e.g., Modern and minimalist with a touch of nature. Professional but friendly. Use a dark theme."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-200"
            />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-300"
          >
            Back
          </button>
        ) : <div />}
        
        {step < 2 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={(step === 1 && (!topic || !domain))}
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto flex items-center justify-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Architecting...
              </>
            ) : (
              'Build My Website'
            )}
          </button>
        )}
      </div>
    </form>
  );
};