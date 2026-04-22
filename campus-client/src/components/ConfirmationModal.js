import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', type = 'danger', inputLabel, inputValue, onInputChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-luna-midnight/80 backdrop-blur-md animate-fade-in">
      <div className="bg-luna-midnight/90 border border-luna-aqua/20 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] shadow-luna-aqua/5 max-w-md w-full overflow-hidden transform transition-all animate-scale-up">
        <div className="p-8">
          <div className="flex items-center gap-5 mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${type === 'danger' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-luna-aqua/10 text-luna-aqua border-luna-aqua/20 luna-glow'}`}>
              {type === 'danger' ? (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              ) : (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">{title}</h3>
          </div>
          <p className="text-text-muted mb-8 text-base font-medium leading-relaxed">
            {message}
          </p>
          
          {inputLabel && (
            <div className="mb-8">
              <label className="block text-[10px] font-black text-luna-aqua uppercase tracking-[0.2em] mb-3">{inputLabel}</label>
              <textarea
                value={inputValue || ''}
                onChange={(e) => onInputChange && onInputChange(e.target.value)}
                className="luna-input resize-none w-full !h-24"
                placeholder={`Enter ${inputLabel.toLowerCase()}...`}
              />
            </div>
          )}

          <div className="flex gap-4 mt-2">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-white/5 text-text-muted hover:bg-white/10 hover:text-white rounded-2xl font-black uppercase tracking-widest transition-all text-sm"
            >
              Abort
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={`flex-1 text-sm ${
                type === 'danger' ? 'luna-button-danger !py-4' : 'luna-button !py-4'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
