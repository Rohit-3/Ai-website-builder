import React, { useState, useEffect, useRef } from 'react';
import type { GeneratedFile, ChatMessage } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { BackIcon } from './icons/BackIcon';
import { DesktopIcon } from './icons/DesktopIcon';
import { TabletIcon } from './icons/TabletIcon';
import { MobileIcon } from './icons/MobileIcon';
import { NewTabIcon } from './icons/NewTabIcon';


declare const JSZip: any;
type PreviewMode = 'desktop' | 'tablet' | 'mobile';

interface ResultDisplayProps {
  files: GeneratedFile[];
  domain: string;
  onGoBack: () => void;
  onRefine: (prompt: string) => void;
  chatMessages: ChatMessage[];
  isRefining: boolean;
}

const getPreviewHtml = (pageName: string, files: GeneratedFile[]): string => {
    const htmlFile = files.find(f => f.name === pageName);
    if (!htmlFile) return `<h1>Error: ${pageName} not found</h1>`;
    return htmlFile.content;
};


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ files, domain, onGoBack, onRefine, chatMessages, isRefining }) => {
  const [activePage, setActivePage] = useState('index.html');
  const [previewHtml, setPreviewHtml] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const suggestionChips = [
    "Change the primary color to a warm orange",
    "Add a testimonials section to the home page",
    "Make the hero title more concise",
    "Generate a new logo",
  ];

  useEffect(() => {
    const srcDoc = getPreviewHtml(activePage, files);
    setPreviewHtml(srcDoc);
  }, [files, activePage]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'navigate' && event.data.page) {
        setActivePage(event.data.page);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleDownload = () => {
    if (typeof JSZip === 'undefined') {
        alert('JSZip library not found. Cannot create zip file.');
        return;
    }
    const zip = new JSZip();
    files.forEach(file => {
      zip.file(file.name, file.content);
    });

    zip.generateAsync({ type: "blob" })
      .then(function(content: any) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        const safeDomain = domain.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${safeDomain}_website.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  };

  const handleOpenNewTab = () => {
    const blob = new Blob([previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() && !isRefining) {
        onRefine(chatInput.trim());
        setChatInput('');
    }
  }
  
  const handleChipClick = (prompt: string) => {
    if (!isRefining) {
        onRefine(prompt);
    }
  }

  const previewWidths: Record<PreviewMode, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  return (
    <div className="flex flex-col flex-grow h-full bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-indigo-500/10 border border-gray-700 overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800/80 flex-wrap gap-2">
            <div className="flex items-center gap-4">
                 <button onClick={onGoBack} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                    <BackIcon className="w-4 h-4" />
                    Back to Wizard
                 </button>
                 <span className="font-mono text-sm bg-gray-900 px-2 py-1 rounded text-cyan-400 hidden sm:block">{activePage}</span>
            </div>
             <div className="flex items-center justify-center gap-1 bg-gray-900 p-1 rounded-md">
                <button onClick={() => setPreviewMode('desktop')} className={`p-1.5 rounded ${previewMode === 'desktop' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}><DesktopIcon className="w-5 h-5" /></button>
                <button onClick={() => setPreviewMode('tablet')} className={`p-1.5 rounded ${previewMode === 'tablet' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}><TabletIcon className="w-5 h-5" /></button>
                <button onClick={() => setPreviewMode('mobile')} className={`p-1.5 rounded ${previewMode === 'mobile' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}><MobileIcon className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-3">
                 <button onClick={handleOpenNewTab} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                     <NewTabIcon className="w-4 h-4"/>
                     <span className="hidden md:inline">New Tab</span>
                 </button>
                 <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-1.5 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-md shadow-md hover:shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all">
                    <DownloadIcon className="w-4 h-4" />
                    Download .zip
                </button>
            </div>
        </div>

        <div className="flex-grow flex flex-col lg:flex-row min-h-0">
            <div className="flex-grow flex flex-col bg-gray-900 justify-center items-center p-4 overflow-hidden">
                 <div className="w-full h-full shadow-lg rounded-md bg-white transition-all duration-500 ease-in-out" style={{ maxWidth: previewWidths[previewMode] }}>
                     <iframe
                        srcDoc={previewHtml}
                        title="Website Preview"
                        className="w-full h-full border-none rounded-md"
                        sandbox="allow-scripts allow-same-origin"
                    />
                 </div>
            </div>
            <div className="flex-shrink-0 flex flex-col h-[60vh] lg:h-auto lg:w-1/3 border-t lg:border-t-0 lg:border-l border-gray-700 bg-gray-800/50">
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {chatMessages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isRefining && (
                        <div className="flex justify-start">
                             <div className="max-w-xs md:max-w-sm rounded-lg px-4 py-2 bg-gray-700 text-gray-200 flex items-center gap-2">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-0"></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150"></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-300"></div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                 <div className="flex-shrink-0 p-3 border-t border-gray-700 space-y-2">
                     <div className="flex flex-wrap gap-2">
                        {suggestionChips.map(chip => (
                            <button key={chip} onClick={() => handleChipClick(chip)} disabled={isRefining} className="px-3 py-1 bg-gray-700/50 text-xs text-gray-300 rounded-full hover:bg-gray-600 transition-colors disabled:opacity-50">
                                {chip}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Tell the AI what to change..."
                            className="flex-grow bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-200 text-sm"
                            disabled={isRefining}
                        />
                        <button type="submit" disabled={isRefining || !chatInput.trim()} className="p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
};