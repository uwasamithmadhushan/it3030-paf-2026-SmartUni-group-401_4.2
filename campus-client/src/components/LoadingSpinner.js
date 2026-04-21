import React from 'react';

const LoadingSpinner = ({ fullScreen, message = 'Syncing Excellence...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative w-20 h-20 mb-8">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-blush-soft animate-spin" />
        {/* Inner Ring */}
        <div className="absolute inset-2 rounded-full border-4 border-white/5 border-b-mauve-dusty animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
        {/* Logo/Icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-violet-deep rounded-xl flex items-center justify-center shadow-luxury">
             <svg className="w-4 h-4 text-ivory-warm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </div>
        </div>
      </div>
      <p className="text-[10px] font-black text-ivory-warm/40 uppercase tracking-[0.4em] animate-pulse">
        {message}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-plum-dark flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
