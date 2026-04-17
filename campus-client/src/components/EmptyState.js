import React from 'react';

const EmptyState = ({ title, message, icon = '🔍', actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-8">{message}</p>
      {onAction && actionText && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
