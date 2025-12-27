import React from 'react';
import Navbar from './Navbar';
import BackButton from './BackButton';
import BackgroundMusic from './BackgroundMusic';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col font-sans relative transition-colors duration-1000 ${
        theme === 'night' ? 'bg-slate-900 text-slate-100' : 
        theme === 'dusk' ? 'bg-orange-50 text-slate-900' : 
        'bg-slate-50 text-slate-900'
    }`}>
      <Navbar />
      <BackButton />
      <BackgroundMusic />

      <main className="flex-grow relative">
        {children}
      </main>
      <footer className={`border-t py-8 mt-auto transition-colors duration-1000 ${
          theme === 'night' ? 'bg-slate-800 border-slate-700 text-slate-400' : 
          theme === 'dusk' ? 'bg-orange-100/50 border-orange-200 text-slate-600' : 
          'bg-white border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>© 2024 以生之名 - 生命守护计划. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
