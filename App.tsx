import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { GeneratorWizard } from './components/GeneratorWizard';
import { ProgressBar } from './components/ProgressBar';
import { ResultDisplay } from './components/ResultDisplay';
import { generateWebsiteProject, refineWebsiteProject } from './services/geminiService';
import { assembleWebsiteFiles } from './services/fileAssembler';
import type { WebsiteProject, ProgressUpdate, ChatMessage, GeneratedFile, GenerationParams } from './types';

const App: React.FC = () => {
  // App Flow State
  const [view, setView] = useState<'form' | 'preview'>('form');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [progress, setProgress] = useState<ProgressUpdate>({ percentage: 0, message: '' });
  const [project, setProject] = useState<WebsiteProject | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generatedFiles: GeneratedFile[] = useMemo(() => {
    if (!project) return [];
    try {
      return assembleWebsiteFiles(project);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred assembling files.';
      console.error("File Assembly failed:", errorMessage);
      setError(`Failed to assemble website files. Error: ${errorMessage}`);
      return [];
    }
  }, [project]);
  
  const handleProgress = useCallback((update: ProgressUpdate) => {
    setProgress(update);
  }, []);

  const handleSubmit = async (params: GenerationParams) => {
    setIsLoading(true);
    setError(null);
    setProject(null);
    setChatMessages([]);
    setProgress({ percentage: 0, message: 'Initiating AI Web Architect...' });

    try {
      const newProject = await generateWebsiteProject(params, handleProgress);
      setProject(newProject);
      setChatMessages([{ sender: 'system', text: 'Your website preview is ready! Ask me to make changes, like "change the accent color to orange" or "add a testimonials section to the home page".' }]);
      setView('preview');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error("Generation failed:", errorMessage, err);
      setError(`Failed to generate website. Please check the console for details. Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setProgress({ percentage: 100, message: 'Completed!' });
    }
  };

  const handleGoBack = () => {
    setView('form');
    setProject(null);
    setChatMessages([]);
    setError(null);
  };

  const handleRefine = async (prompt: string) => {
    if (!project) return;
    setIsRefining(true);
    const userMessage: ChatMessage = { sender: 'user', text: prompt };
    setChatMessages(prev => [...prev, userMessage]);
    
    try {
      const updatedProject = await refineWebsiteProject(project, prompt);
      
      setProject(updatedProject);
      
      const responseText = "Done! I've updated the preview with your changes. What's next?";
      setChatMessages(prev => [...prev, { sender: 'system', text: responseText }]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error("Refinement failed:", errorMessage);
      setChatMessages(prev => [...prev, { sender: 'system', text: `Sorry, I encountered an error: ${errorMessage}` }]);
    } finally {
      setIsRefining(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
        {view === 'form' ? (
          <div className="flex-grow flex flex-col justify-center">
            <div className="max-w-4xl w-full mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-indigo-500/10 p-6 md:p-10 border border-gray-700">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-4">
                  AI Web Architect
                </h2>
                <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto">
                  Describe your vision. Our AI will design, write, and code a unique, multi-page website with custom imagery, ready for you to refine and deploy.
                </p>
                
                <GeneratorWizard
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />

                {error && (
                  <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
                    <p><strong>Error:</strong> {error}</p>
                  </div>
                )}

                {isLoading && (
                  <div className="mt-8">
                    <ProgressBar percentage={progress.percentage} message={progress.message} />
                  </div>
                )}
              </div>
              <footer className="text-center text-gray-600 mt-12 pb-8">
                <p>Powered by the Gemini API</p>
              </footer>
            </div>
          </div>
        ) : (
           <ResultDisplay
            files={generatedFiles}
            domain={project?.domain ?? 'example.com'}
            onGoBack={handleGoBack}
            onRefine={handleRefine}
            chatMessages={chatMessages}
            isRefining={isRefining}
          />
        )}
      </main>
    </div>
  );
};

export default App;
