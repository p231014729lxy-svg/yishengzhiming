import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on home page
  if (location.pathname === '/') return null;

  return (
    <button 
      onClick={() => navigate(-1)}
      className="fixed top-24 left-4 z-40 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg text-slate-600 hover:text-slate-900 hover:bg-white hover:scale-105 transition-all border border-slate-100/50 group"
      title="返回上一页"
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
    </button>
  );
};

export default BackButton;
