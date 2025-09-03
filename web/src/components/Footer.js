import React from 'react';
import { FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="py-8 text-center mt-12">
      <div className="flex flex-col items-center gap-3">
        <a
          href="https://github.com/maxbengtzen/gridprint"
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-700 hover:text-teal-600 transition-colors duration-200"
        >
          <FaGithub className="text-2xl" />
        </a>
        
        <p className="text-base-content/70 text-sm">
          Created by Max Bengtzén
        </p>
      </div>
    </footer>
  );
};

export default Footer;