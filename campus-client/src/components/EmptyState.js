import React from 'react';

const EmptyState = ({ title, message, actionText, onAction }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 md:p-16 text-center max-w-2xl mx-auto mt-8">
      <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm font-medium mb-8">{message}</p>
      {onAction && actionText && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#10B981] text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
