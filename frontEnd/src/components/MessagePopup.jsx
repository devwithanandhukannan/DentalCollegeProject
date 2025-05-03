import React, { useState, useEffect } from 'react';

const MessagePopup = ({ message, bgColor = 'bg-blue-500' }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Automatically hide the popup after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    // Cleanup timer on unmount or when message changes
    return () => clearTimeout(timer);
  }, [message]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`${bgColor} text-white px-4 py-2 rounded-lg shadow-lg max-w-xs flex items-center justify-between transition-all duration-300 ease-in-out`}
      >
        <span>{message}</span>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MessagePopup;