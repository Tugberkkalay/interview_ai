import React from 'react';

interface ConnectionLoadingProps {
  loadingText: string;
}

export const ConnectionLoading: React.FC<ConnectionLoadingProps> = ({ loadingText }) => {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/95 transition-all duration-1000 ease-in-out">
        <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
            <div className="absolute inset-4 bg-indigo-500 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-400 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 0v20" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2 12h20" />
                </svg>
            </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white tracking-tight mb-4 animate-pulse text-center px-4">
            Uzman Hazırlanıyor
        </h2>
        <div className="h-8 flex items-center justify-center px-4 w-full">
            <p className="text-blue-300 font-mono text-center text-sm md:text-lg transition-all duration-500 truncate w-full">
                {">"} {loadingText}
            </p>
        </div>
    </div>
  );
};