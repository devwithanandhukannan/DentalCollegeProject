import React, { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Sidebar = ({ options }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={`bg-gray-800 text-white h-[95vh] transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
    >
      {/* Toggle Button */}
      <div className="p-4 flex justify-between items-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white focus:outline-none"
        >
          <FaBars size={20} />
        </button>
      </div>

      {/* Sidebar Options */}
      <ul className="mt-4">
        {options.map((option, index) => (
          <li key={index}>
            <Link
              to={option.to} // Use 'to' for the route
              className="flex items-center p-4 hover:bg-gray-700 cursor-pointer no-underline text-white"
            >
              <span className="text-xl">{option.icon}</span>
              {isExpanded && <span className="ml-4">{option.text}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;