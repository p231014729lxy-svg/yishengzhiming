import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Leaf, Activity, MapPin, MessageCircle, Heart, User, Bell, Headphones, Play, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const [currentQuote, setCurrentQuote] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [stats, setStats] = useState(null);

  // Daily Healing Quotes
  const quotes = [
    "思念不会消散，只会扎根成前行的力量。",
    "每一次呼吸，都是生命给予的温柔拥抱。",
    "在朽壤中生花，于裂缝处见光。",
    "爱是穿越时空的连接，你从未孤单。"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);
    
    // Simulate New User Guide Trigger
    if (user && !localStorage.getItem('guideShown')) {
      setTimeout(() => setShowGuide(true), 1500);
    }

    return () => clearInterval(timer);
  }, [user]);

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:3000/api/user/growth')
        .then(res => setStats(res.data))
        .catch(err => console.error("Failed to load stats", err));
    }
  }, [token]);

  const closeGuide = () => {
    setShowGuide(false);
    localStorage.setItem('guideShown', 'true');
  };

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-1000 ${
        theme === 'night' ? 'bg-slate-900' : theme === 'dusk' ? 'bg-orange-50' : 'bg-[#fdfbf7]'
    }`}>
      {/* 1. Dynamic Theme Banner */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Slider (Mock) */}
        <div className="absolute inset-0 z-0">
          <motion.img 
            key={currentQuote} // Just reusing for simple demo effect
            initial={{ opacity: 0.8, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2 }}
            src={
                theme === 'night' ? "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2000&auto=format&fit=crop" :
                theme === 'dusk' ? "https://images.unsplash.com/photo-1616036740257-9449ea1f6605?q=80&w=2000&auto=format&fit=crop" :
                "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=2574&auto=format&fit=crop"
            }
            alt="Theme Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 font-serif">
              以生之名<br/>
              <span className="text-brand-200 text-3xl md:text-5xl mt-4 block font-sans font-light">朽壤生花 · 虬枝焕青</span>
            </h1>
            
            {/* Daily Quote Carousel */}
            <div className="h-16 mb-10 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p 
                  key={currentQuote}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xl md:text-2xl text-white/90 font-light italic"
                >
                  “{quotes[currentQuote]}”
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link to="/online" className="px-8 py-3 bg-brand-600 rounded-full font-medium hover:bg-brand-500 transition-all shadow-lg hover:shadow-brand-500/50 flex items-center">
                <Leaf className="mr-2 w-5 h-5" /> 埋下希望种子
              </Link>
              <Link to="/healing" className="px-8 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full font-medium hover:bg-white/30 transition-all flex items-center">
                <Headphones className="mr-2 w-5 h-5" /> 开启冥想疗愈
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Personalized Entries & Progress */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20 w-full">
        <div className="grid md:grid-cols-4 gap-4">
          <EntryCard 
            title="快速体验" 
            icon={<Play className="w-5 h-5 text-white" />} 
            bg={
                theme === 'night' ? "bg-gradient-to-br from-brand-700 to-brand-900 border border-brand-500/30" :
                theme === 'dusk' ? "bg-gradient-to-br from-brand-500 to-brand-700" :
                "bg-gradient-to-br from-brand-400 to-brand-600"
            } 
            link="/tree-hollow" 
            desc="一键进入树洞" 
          />
          <EntryCard 
            title="我的档案" 
            icon={<User className="w-5 h-5 text-white" />} 
            bg={
                theme === 'night' ? "bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-500/30" :
                theme === 'dusk' ? "bg-gradient-to-br from-blue-500 to-blue-700" :
                "bg-gradient-to-br from-blue-400 to-blue-600"
            } 
            link="/online" 
            desc="生命成长记录" 
          />
          <EntryCard 
            title="活动提醒" 
            icon={<Bell className="w-5 h-5 text-white" />} 
            bg={
                theme === 'night' ? "bg-gradient-to-br from-orange-700 to-orange-900 border border-orange-500/30" :
                theme === 'dusk' ? "bg-gradient-to-br from-orange-500 to-orange-700" :
                "bg-gradient-to-br from-orange-400 to-orange-600"
            } 
            link="/offline" 
            desc="线下活动倒计时" 
          />
          <EntryCard 
            title="客服咨询" 
            icon={<MessageCircle className="w-5 h-5 text-white" />} 
            bg={
                theme === 'night' ? "bg-gradient-to-br from-purple-700 to-purple-900 border border-purple-500/30" :
                theme === 'dusk' ? "bg-gradient-to-br from-purple-500 to-purple-700" :
                "bg-gradient-to-br from-purple-400 to-purple-600"
            } 
            link="#" 
            desc="温暖陪伴 24h" 
          />
        </div>
      </div>

      {/* 3. Activity Timeline */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-bold mb-4 ${theme === 'night' ? 'text-slate-100' : 'text-slate-800'}`}>生命成长脉络</h2>
            <div className="w-20 h-1 bg-brand-500 mx-auto rounded-full mb-8"></div>
            
            {/* Timeline */}
            <div className="relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 hidden md:block"></div>
              <div className="grid md:grid-cols-4 gap-8 relative z-10">
                <TimelineItem step="1" title="线上体验" desc="积攒能量，点亮希望" active theme={theme} />
                <TimelineItem step="2" title="线下参与" desc="百城联动，真实救援" theme={theme} />
                <TimelineItem step="3" title="线上沉淀" desc="情感归档，记忆永存" theme={theme} />
                <TimelineItem step="4" title="长期成长" desc="专业疗愈，重塑自我" theme={theme} />
              </div>
            </div>
          </div>

          {/* My Growth Progress */}
          {user && (
            <div className={`p-8 rounded-3xl shadow-sm border max-w-4xl mx-auto transition-colors ${
                theme === 'night' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
            }`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`font-bold text-lg ${theme === 'night' ? 'text-slate-100' : 'text-slate-800'}`}>我的成长进度</h3>
                <Link to="/online" className="text-brand-600 text-sm hover:underline">查看详情</Link>
              </div>
              <div className="grid grid-cols-3 gap-8 text-center">
                <ProgressCircle 
                  label="能量积攒" 
                  percent={Math.min(100, Math.round(((stats?.energy || 0) / 500) * 100))} 
                  displayValue={stats?.energy || 0}
                  color="text-brand-500" 
                  theme={theme}
                />
                <ProgressCircle 
                  label="冥想时长(分)" 
                  percent={Math.min(100, Math.round(((stats?.totalMeditationTime || 0) / 60) * 100))} 
                  displayValue={stats?.totalMeditationTime || 0}
                  color="text-blue-500" 
                  theme={theme}
                />
                <ProgressCircle 
                  label="树洞记录" 
                  percent={Math.min(100, Math.round(((stats?.treeHollowPosts || 0) / 10) * 100))} 
                  displayValue={stats?.treeHollowPosts || 0}
                  color="text-purple-500" 
                  theme={theme}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* New User Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full relative"
            >
              <button onClick={closeGuide} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">欢迎来到以生之名</h3>
                <p className="text-slate-600 mb-6">为了提供更精准的温暖，你想先体验什么？</p>
                <div className="space-y-3">
                  <button onClick={closeGuide} className="w-full py-3 rounded-xl border border-brand-200 text-brand-700 hover:bg-brand-50 font-medium transition-colors">
                    我想疏导思念情绪
                  </button>
                  <button onClick={closeGuide} className="w-full py-3 rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 font-medium transition-colors">
                    我需要个人成长指引
                  </button>
                  <button onClick={closeGuide} className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors">
                    只是随便看看
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EntryCard = ({ title, icon, bg, desc, link }) => (
  <Link to={link} className={`${bg} p-6 rounded-2xl text-white shadow-lg hover:-translate-y-1 transition-transform group`}>
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
        {icon}
      </div>
      <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <h3 className="font-bold text-lg mb-1">{title}</h3>
    <p className="text-white/80 text-sm">{desc}</p>
  </Link>
);

const TimelineItem = ({ step, title, desc, active, theme }) => (
  <div className="flex flex-col items-center relative group">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-4 z-10 transition-colors ${
      active 
        ? 'bg-brand-500 text-white shadow-brand-500/50 shadow-lg' 
        : 'bg-white border-2 border-slate-200 text-slate-400 group-hover:border-brand-300 group-hover:text-brand-300'
    }`}>
      {step}
    </div>
    <h4 className={`font-bold mb-1 ${
      active 
        ? (theme === 'night' ? 'text-slate-100' : 'text-slate-900') 
        : 'text-slate-500'
    }`}>
      {title}
    </h4>
    <p className="text-xs text-slate-400 max-w-[120px] text-center">{desc}</p>
  </div>
);

const ProgressCircle = ({ label, percent, displayValue, color, theme }) => (
  <div className="flex flex-col items-center">
    <div className="relative w-24 h-24 mb-3">
      <svg className="w-full h-full transform -rotate-90">
        <circle 
          cx="48" cy="48" r="40" 
          stroke="currentColor" strokeWidth="8" fill="transparent" 
          className={theme === 'night' ? "text-slate-700" : "text-slate-100"} 
        />
        <circle 
          cx="48" cy="48" r="40" 
          stroke="currentColor" strokeWidth="8" fill="transparent" 
          strokeDasharray={251.2} 
          strokeDashoffset={251.2 - (251.2 * percent) / 100} 
          className={`${color} transition-all duration-1000`} 
          strokeLinecap="round" 
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center font-bold text-xl ${theme === 'night' ? 'text-slate-200' : 'text-slate-700'}`}>
        {displayValue !== undefined ? displayValue : `${percent}%`}
      </div>
    </div>
    <span className={`text-sm font-medium ${theme === 'night' ? 'text-slate-400' : 'text-slate-600'}`}>{label}</span>
  </div>
);

export default Home;
