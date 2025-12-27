import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf, Activity, MapPin, Heart, LogOut, User, MessageCircle, Sparkles, BookOpen, Sun, Moon, Sunset } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, cycleTheme } = useTheme();

  const navItems = [
    { name: '首页', path: '/', icon: <Leaf className="w-4 h-4" /> },
    { name: '思念扎根', path: '/memorial', icon: <Heart className="w-4 h-4" /> },
    { name: '线下行动', path: '/offline', icon: <MapPin className="w-4 h-4" /> },
    { name: '树洞', path: '/tree-hollow', icon: <MessageCircle className="w-4 h-4" /> },
    { name: '疗愈空间', path: '/healing', icon: <Sparkles className="w-4 h-4" /> },
  ];

  const getThemeIcon = () => {
      if (theme === 'day') return <Sun className="w-5 h-5 text-orange-400" />;
      if (theme === 'dusk') return <Sunset className="w-5 h-5 text-rose-400" />;
      return <Moon className="w-5 h-5 text-slate-200" />;
  };

  return (
    <nav className={`backdrop-blur-md sticky top-0 z-50 border-b shadow-sm transition-all duration-300 ${
        theme === 'night' ? 'bg-slate-900/90 border-slate-800' : 
        theme === 'dusk' ? 'bg-orange-50/90 border-orange-200' : 
        'bg-white/90 border-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white group-hover:bg-brand-600 transition-colors shadow-brand-500/20 shadow-lg">
                <Leaf className="w-5 h-5" />
              </div>
              <span className={`text-xl font-bold tracking-tight group-hover:text-brand-600 transition-colors ${theme === 'night' ? 'text-slate-100' : 'text-slate-800'}`}>以生之名</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'text-brand-700 bg-brand-50'
                    : (theme === 'night' ? 'text-slate-400 hover:text-brand-400 hover:bg-slate-800' : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50')
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
            
            <div className={`flex items-center space-x-4 ml-6 pl-6 border-l ${theme === 'night' ? 'border-slate-700' : 'border-slate-200'}`}>
                <button 
                    onClick={cycleTheme}
                    className={`p-2 rounded-full transition-all ${
                        theme === 'night' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                    }`}
                    title="切换主题"
                >
                    {getThemeIcon()}
                </button>

                {user ? (
                  <>
                    <div className={`flex items-center text-sm font-medium px-3 py-1 rounded-full cursor-pointer transition-colors ${
                        theme === 'night' ? 'text-slate-200 bg-slate-800 hover:bg-slate-700' : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
                    }`}>
                      <User className="w-4 h-4 mr-2 text-brand-500" />
                      {user.username}
                    </div>
                    <button 
                      onClick={logout}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      title="退出登录"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link to="/login" className={`px-3 py-2 text-sm font-medium ${theme === 'night' ? 'text-slate-300 hover:text-brand-400' : 'text-slate-600 hover:text-brand-600'}`}>
                      登录
                    </Link>
                    <Link to="/register" className="bg-brand-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-brand-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                      注册
                    </Link>
                  </div>
                )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <button 
                onClick={cycleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
                {getThemeIcon()}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`focus:outline-none p-2 ${theme === 'night' ? 'text-slate-300 hover:text-brand-400' : 'text-slate-600 hover:text-brand-500'}`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className={`md:hidden border-b absolute w-full shadow-xl ${
            theme === 'night' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 block px-4 py-3 rounded-xl text-base font-medium ${
                  location.pathname === item.path
                    ? 'text-brand-600 bg-brand-50'
                    : (theme === 'night' ? 'text-slate-400 hover:text-brand-400 hover:bg-slate-800' : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50')
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
            <div className={`border-t pt-4 mt-2 ${theme === 'night' ? 'border-slate-800' : 'border-slate-100'}`}>
              {user ? (
                 <div className="flex items-center justify-between px-2">
                    <div className={`flex items-center font-medium ${theme === 'night' ? 'text-slate-200' : 'text-slate-800'}`}>
                       <User className="w-5 h-5 mr-2 text-brand-500" />
                       {user.username}
                    </div>
                    <button onClick={logout} className="text-sm text-red-500 px-3 py-1 bg-red-50 rounded-lg">退出</button>
                 </div>
              ) : (
                <div className="space-y-3">
                  <Link to="/login" className={`block text-center w-full border px-5 py-3 rounded-xl text-sm font-medium ${
                      theme === 'night' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}>
                    登录
                  </Link>
                  <Link to="/register" className="block text-center w-full bg-brand-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-brand-700 shadow-md">
                    立即注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
