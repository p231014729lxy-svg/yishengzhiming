import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Music, BookOpen, UserCheck, Activity, BarChart, Smile, Frown, Meh, Wind, Moon, Sun, Clock, AlertCircle, Send, X, Bot, Headphones, Maximize2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Import images
import img1 from '../images/1.jpg';
import img2 from '../images/2.jpg';
import img3 from '../images/3.jpg';
import img4 from '../images/4.jpg';

// Audio tracks
const tracks = {
  gong: '/src/musics/gong.mp3',
  shang: '/src/musics/shang.mp3',
  jue: '/src/musics/jue.mp3',
  zhi: '/src/musics/zhi.mp3',
  yu: '/src/musics/yu.mp3',
  kongshan: '/src/musics/kongshan.mp3',
  water: '/src/musics/water.mp3',
  sleep: '/src/musics/sleep.mp3',
  wuyin_general: '/src/musics/wuyin_general.mp3',
  back: '/src/musics/back.mp3',
  rain: '/src/musics/rain.mp3'
};

const Healing = () => {
  const [activeTab, setActiveTab] = useState('meditation'); // meditation, diary, consult, music
  const { token } = useAuth();
  const { theme } = useTheme();
  const [userStats, setUserStats] = useState(null);

  const fetchStats = async () => {
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:3000/api/user/growth', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserStats(res.data);
    } catch (err) {
      console.error("Failed to fetch user stats", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  return (
    <div className={`max-w-7xl mx-auto px-4 py-12 min-h-screen transition-colors duration-1000 ${
        theme === 'night' ? 'bg-slate-900 text-slate-100' :
        theme === 'dusk' ? 'bg-orange-50 text-slate-900' :
        'bg-[#f8fcfc] text-slate-900'
    }`}>
      <div className="text-center mb-12">
        <h2 className={`text-4xl font-serif font-bold mb-4 ${theme === 'night' ? 'text-slate-100' : 'text-slate-800'}`}>疗愈空间</h2>
        <p className={`${theme === 'night' ? 'text-slate-400' : 'text-slate-600'}`}>停下来，深呼吸，在这里找回内心的平静。</p>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        <NavButton active={activeTab === 'meditation'} onClick={() => setActiveTab('meditation')} icon={<Wind />} label="冥想引导" color={theme === 'night' ? 'bg-teal-900 text-teal-200 border-teal-700' : 'bg-teal-100 text-teal-700'} theme={theme} />
        <NavButton active={activeTab === 'diary'} onClick={() => setActiveTab('diary')} icon={<BookOpen />} label="情绪日记" color={theme === 'night' ? 'bg-rose-900 text-rose-200 border-rose-700' : 'bg-rose-100 text-rose-700'} theme={theme} />
        <NavButton active={activeTab === 'consult'} onClick={() => setActiveTab('consult')} icon={<UserCheck />} label="专业咨询" color={theme === 'night' ? 'bg-blue-900 text-blue-200 border-blue-700' : 'bg-blue-100 text-blue-700'} theme={theme} />
        <NavButton active={activeTab === 'music'} onClick={() => setActiveTab('music')} icon={<Music />} label="疗愈音乐" color={theme === 'night' ? 'bg-indigo-900 text-indigo-200 border-indigo-700' : 'bg-indigo-100 text-indigo-700'} theme={theme} />
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === 'meditation' && <MeditationSection token={token} userStats={userStats} onUpdate={fetchStats} theme={theme} />}
        {activeTab === 'diary' && <MoodDiarySection token={token} theme={theme} />}
        {activeTab === 'consult' && <ConsultSection theme={theme} />}
        {activeTab === 'music' && <MusicSection theme={theme} />}
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, color, theme }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-6 py-3 rounded-2xl transition-all duration-300 font-bold border ${
      active 
      ? `${color} shadow-lg scale-105` 
      : (theme === 'night' ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-100')
    }`}
  >
    <span className="mr-2 w-5 h-5">{icon}</span>
    {label}
  </button>
);

/* --- Sub-Sections --- */

const MeditationSection = ({ token, userStats, onUpdate, theme }) => {
  const [isMeditating, setIsMeditating] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const audioRef = useRef(null);

  const sessions = [
    { id: 'thought', title: "思念疏导", icon: <Moon className="w-6 h-6 text-purple-500" />, desc: "五音疗愈，抚平思念" },
    { id: 'sleep', title: "睡前放松", icon: <Wind className="w-6 h-6 text-blue-500" />, desc: "空山鸟语，安然入眠" },
    { id: 'morning', title: "晨间唤醒", icon: <Sun className="w-6 h-6 text-orange-500" />, desc: "流水潺潺，开启新一天" },
  ];

  // Helper to get track source
  const getTrackSrc = (sessionId) => {
      if (sessionId === 'thought') {
          const tones = ['gong', 'shang', 'jue', 'zhi', 'yu'];
          const randomTone = tones[Math.floor(Math.random() * tones.length)];
          return tracks[randomTone];
      } else if (sessionId === 'sleep') {
          return tracks.kongshan;
      } else if (sessionId === 'morning') {
          return tracks.water;
      }
      return '';
  };

  const handleStart = async (session) => {
    if (!token) {
        alert("请先登录");
        return;
    }
    setCurrentSession(session);
    setIsMeditating(true);
    
    // Pause Global BGM
    window.dispatchEvent(new Event('pause-bgm'));

    if (audioRef.current) {
        const src = getTrackSrc(session.id);
        audioRef.current.src = src;
        audioRef.current.loop = false; // Important: Do NOT loop, let it end naturally
        audioRef.current.play().catch(e => console.log("Audio play failed", e));
        
        // Remove old listeners to prevent duplicates if any
        audioRef.current.onended = null;
        
        // Set up completion handler
        audioRef.current.onended = async () => {
             try {
                // Use actual duration from the audio element
                const durationMinutes = Math.ceil(audioRef.current.duration / 60);
                
                await axios.post('http://localhost:3000/api/healing/meditation', {
                    duration: durationMinutes,
                    type: session.title
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert(`完成了 ${session.title} 练习！`);
                
                // Finish
                setIsMeditating(false);
                window.dispatchEvent(new Event('resume-bgm')); // Resume BGM
                onUpdate(); // Refresh stats
            } catch (err) {
                console.error(err);
                alert("记录失败，请重试");
                setIsMeditating(false);
                window.dispatchEvent(new Event('resume-bgm'));
            }
        };
    }
  };

  const handleStop = () => {
      setIsMeditating(false);
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.onended = null; // Clear handler
      }
      window.dispatchEvent(new Event('resume-bgm'));
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <h3 className={`text-2xl font-bold mb-4 ${theme === 'night' ? 'text-slate-100' : 'text-slate-800'}`}>精选冥想</h3>
        {sessions.map((s, i) => (
          <motion.div 
            key={i} 
            whileHover={{ x: 5 }} 
            onClick={() => !isMeditating && handleStart(s)}
            className={`p-6 rounded-2xl border shadow-sm flex justify-between items-center cursor-pointer transition-all ${
                theme === 'night' 
                ? 'bg-slate-800 border-slate-700 hover:border-teal-500/50' 
                : 'bg-white border-slate-100 hover:border-teal-200'
            } ${isMeditating ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${theme === 'night' ? 'bg-slate-700' : 'bg-slate-50'}`}>{s.icon}</div>
              <div>
                <h4 className={`font-bold ${theme === 'night' ? 'text-slate-200' : 'text-slate-800'}`}>{s.title}</h4>
                <p className={`text-xs ${theme === 'night' ? 'text-slate-400' : 'text-slate-500'}`}>{s.desc}</p>
              </div>
            </div>
            <div className={`flex items-center text-sm ${theme === 'night' ? 'text-slate-500' : 'text-slate-400'}`}>
              <span className="mr-3">Full Track</span>
              <button className="p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600"><Play className="w-4 h-4 ml-0.5" /></button>
            </div>
          </motion.div>
        ))}
      </div>
      <div className={`rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-center items-center text-center min-h-[300px] ${
          theme === 'night' ? 'bg-teal-950' : 'bg-teal-900'
      }`}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=2525&auto=format&fit=crop')] opacity-20 bg-cover bg-center"></div>
        <div className="relative z-10 w-full">
          {isMeditating ? (
             <div className="animate-pulse">
                <h3 className="text-3xl font-serif font-bold mb-4">正在进行...</h3>
                <p className="mb-8 opacity-90">{currentSession?.title}</p>
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
                <button onClick={handleStop} className="px-6 py-2 border border-white rounded-full hover:bg-white/20">结束练习</button>
             </div>
          ) : (
            <>
                <h3 className="text-3xl font-serif font-bold mb-4">今日冥想时刻</h3>
                <div className="grid grid-cols-2 gap-4 mb-8 text-center w-full max-w-xs mx-auto">
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                        <p className="text-2xl font-bold">{userStats?.totalMeditationTime || 0}</p>
                        <p className="text-xs opacity-70">总分钟数</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                        <p className="text-2xl font-bold">{userStats?.meditationSessions || 0}</p>
                        <p className="text-xs opacity-70">练习次数</p>
                    </div>
                </div>
                <button className="px-8 py-3 bg-white text-teal-900 rounded-full font-bold hover:bg-teal-50 transition-colors opacity-50 cursor-not-allowed">
                    请选择左侧课程
                </button>
            </>
          )}
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

const MoodDiarySection = ({ token, theme }) => {
  const [selectedMood, setSelectedMood] = useState('');
  const [content, setContent] = useState('');
  const [plan, setPlan] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
      try {
          const res = await axios.get('http://localhost:3000/api/healing/mood', {
              headers: { Authorization: `Bearer ${token}` }
          });
          setHistory(res.data);
      } catch (err) {
          console.error(err);
      }
  };

  const handleSave = async () => {
      if (!token) return alert("请先登录");
      if (!selectedMood) return alert("请选择今日情绪");

      try {
          await axios.post('http://localhost:3000/api/healing/mood', {
              mood: selectedMood,
              content: `原因: ${content}\n应对: ${plan}`,
              tags: [selectedMood]
          }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          alert("日记保存成功！");
          setSelectedMood('');
          setContent('');
          setPlan('');
          fetchHistory();
      } catch (err) {
          alert("保存失败");
      }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-8">
        <div className={`p-8 rounded-3xl border shadow-sm ${theme === 'night' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <h3 className={`text-xl font-bold mb-6 ${theme === 'night' ? 'text-slate-100' : 'text-slate-800'}`}>今日情绪三问</h3>
            <div className="space-y-6">
            <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'night' ? 'text-slate-400' : 'text-slate-600'}`}>1. 今天的核心情绪是什么？</label>
                <div className="flex gap-4 flex-wrap">
                {['开心', '平静', '焦虑', '悲伤', '愤怒'].map(m => (
                    <button 
                        key={m} 
                        onClick={() => setSelectedMood(m)}
                        className={`px-4 py-2 rounded-full border text-sm transition-all ${
                            selectedMood === m 
                            ? 'bg-rose-500 text-white border-rose-500' 
                            : (theme === 'night' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600')
                        }`}
                    >
                    {m}
                    </button>
                ))}
                </div>
            </div>
            <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'night' ? 'text-slate-400' : 'text-slate-600'}`}>2. 是什么引发了这种情绪？</label>
                <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-sm focus:ring-rose-500 focus:border-rose-500 ${
                        theme === 'night' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200'
                    }`} 
                    rows="2" 
                    placeholder="简短记录一下..."
                ></textarea>
            </div>
            <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'night' ? 'text-slate-400' : 'text-slate-600'}`}>3. 我想如何应对？</label>
                <textarea 
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-sm focus:ring-rose-500 focus:border-rose-500 ${
                        theme === 'night' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200'
                    }`} 
                    rows="2" 
                    placeholder="写下你的应对计划..."
                ></textarea>
            </div>
            <button 
                onClick={handleSave}
                className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors"
            >
                保存日记
            </button>
            </div>
        </div>
      </div>
      
      <div className="space-y-6">
         <div className={`p-6 rounded-3xl border shadow-sm ${theme === 'night' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
           <h4 className={`font-bold mb-4 flex items-center ${theme === 'night' ? 'text-slate-100' : 'text-slate-800'}`}>
               <Clock className="w-4 h-4 mr-2" /> 历史记录
           </h4>
           <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
               {history.length === 0 ? (
                   <p className="text-sm text-slate-400 text-center py-4">暂无记录，开始写第一篇吧</p>
               ) : (
                   history.map(entry => (
                       <div key={entry.id} className={`p-3 rounded-xl border ${theme === 'night' ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-100'}`}>
                           <div className="flex justify-between items-center mb-1">
                               <span className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleDateString()}</span>
                               <span className={`px-2 py-0.5 text-xs rounded-full ${theme === 'night' ? 'bg-rose-900/50 text-rose-300' : 'bg-rose-100 text-rose-600'}`}>{entry.mood}</span>
                           </div>
                           <p className={`text-sm line-clamp-2 ${theme === 'night' ? 'text-slate-300' : 'text-slate-700'}`}>{entry.content}</p>
                       </div>
                   ))
               )}
           </div>
         </div>
         
         <div className={`p-6 rounded-3xl border shadow-sm flex items-center justify-between ${theme === 'night' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div>
                <h4 className={`font-bold ${theme === 'night' ? 'text-slate-100' : 'text-slate-800'}`}>情绪周报</h4>
                <p className="text-xs text-slate-500 mt-1">记录 {history.length} 篇日记</p>
            </div>
            <BarChart className="w-12 h-12 text-slate-200" />
         </div>
      </div>
    </div>
  );
};

const ConsultSection = ({ theme }) => {
  const [showChat, setShowChat] = useState(false);

  const handleBook = () => alert("目前已满,请稍后");
  const handleDetail = () => alert("该功能正在开发，劳烦您等待");

  const doctors = [
      { name: "张欣博士", title: "资深心理咨询师", expertise: "焦虑缓解 / 认知疗法", desc: "拥有15年临床经验，擅长认知行为疗法（CBT），帮助您识别并改变负面思维模式，缓解生活压力与焦虑。", bg: "bg-blue-100" },
      { name: "王宇教授", title: "临床心理学专家", expertise: "创伤疗愈 / 哀伤辅导", desc: "专注于创伤后应激障碍（PTSD）与哀伤辅导，以温暖而坚定的力量，陪伴您走过生命中最艰难的时刻。", bg: "bg-green-100" },
      { name: "刘一老师", title: "家庭治疗师", expertise: "亲密关系 / 家庭系统", desc: "系统式家庭治疗流派，专注于解决伴侣冲突与亲子关系困扰，重建家庭和谐。", bg: "bg-orange-100" },
      { name: "林静医师", title: "正念减压导师", expertise: "情绪管理 / 睡眠改善", desc: "将正念冥想融入心理咨询，帮助您改善睡眠质量，提升情绪调节能力。", bg: "bg-purple-100" }
  ];

  if (showChat) {
      return <AIChatSection onClose={() => setShowChat(false)} theme={theme} />;
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <h3 className={`text-xl font-bold ${theme === 'night' ? 'text-slate-100' : 'text-slate-800'}`}>推荐咨询师</h3>
        
        {/* AI Entry */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 rounded-2xl shadow-md text-white flex justify-between items-center relative overflow-hidden group cursor-pointer" onClick={() => setShowChat(true)}>
            <div className="relative z-10">
                <h4 className="text-2xl font-bold mb-1 flex items-center"><Bot className="mr-2" /> AI 心理抚慰师 "安抚者"</h4>
                <p className="opacity-90">24小时在线，随时倾听你的心声，提供温暖支持。</p>
            </div>
            <button className="bg-white text-teal-600 px-6 py-2 rounded-full font-bold shadow-lg group-hover:scale-105 transition-transform">立即交谈</button>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {doctors.map((doc, i) => (
          <div key={i} className={`p-6 rounded-2xl border shadow-sm flex gap-4 ${theme === 'night' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className={`w-16 h-16 ${theme === 'night' ? 'bg-slate-700 text-slate-300' : doc.bg} rounded-full flex-shrink-0 flex items-center justify-center font-bold text-slate-500`}>
                {doc.name[0]}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`font-bold ${theme === 'night' ? 'text-slate-200' : 'text-slate-800'}`}>{doc.name}</h4>
                  <p className={`text-xs ${theme === 'night' ? 'text-slate-400' : 'text-slate-500'}`}>{doc.title} · 从业 10+ 年</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-md ${theme === 'night' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>擅长：{doc.expertise}</span>
              </div>
              <p className={`text-sm mt-2 line-clamp-2 ${theme === 'night' ? 'text-slate-400' : 'text-slate-600'}`}>{doc.desc}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={handleBook} className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">立即报名</button>
                <button onClick={handleDetail} className={`px-4 py-1.5 border text-sm rounded-lg ${theme === 'night' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>查看详情</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-2xl">
          <h4 className="font-bold text-lg mb-2">团体疗愈小组</h4>
          <p className="text-sm text-blue-100 mb-4">本周主题：在告别中成长</p>
          <div className="flex -space-x-2 mb-4">
            {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-blue-500"></div>)}
            <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-blue-500 flex items-center justify-center text-xs">+5</div>
          </div>
          <button onClick={handleBook} className="w-full py-2 bg-white text-blue-600 rounded-lg font-bold text-sm">立即报名</button>
        </div>
        <div className={`p-6 rounded-2xl border ${theme === 'night' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <h4 className={`font-bold mb-2 ${theme === 'night' ? 'text-slate-200' : 'text-slate-800'}`}>心理测试</h4>
          <p className={`text-xs mb-4 ${theme === 'night' ? 'text-slate-500' : 'text-slate-500'}`}>了解当下的心理状态</p>
          <ul className={`space-y-2 text-sm ${theme === 'night' ? 'text-slate-400' : 'text-slate-600'}`}>
            <li className="flex items-center"><Activity className="w-4 h-4 mr-2 text-blue-500" /> 焦虑程度自测</li>
            <li className="flex items-center"><Activity className="w-4 h-4 mr-2 text-blue-500" /> 哀伤阶段评估</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const MusicSection = ({ theme }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const audioRef = useRef(null);

  const playlist = [
    { id: 'rain', title: "雨夜安眠", color: "bg-slate-800", src: tracks.sleep, cover: img1, desc: "淅沥雨声，伴你入眠" },
    { id: 'forest', title: "森林漫步", color: "bg-green-800", src: tracks.wuyin_general, cover: img2, desc: "漫步林间，呼吸自由" },
    { id: 'whale', title: "深海鲸鸣", color: "bg-blue-900", src: tracks.back, cover: img3, desc: "来自深海的呼唤" },
    { id: 'fire', title: "壁炉暖火", color: "bg-orange-900", src: tracks.rain, cover: img4, desc: "温暖火光，驱散寒冷" }
  ];

  const handlePlay = (track) => {
      if (currentTrack?.id === track.id) {
          setShowFullPlayer(true);
      } else {
          window.dispatchEvent(new Event('pause-bgm')); // Pause BGM
          setCurrentTrack(track);
          if (audioRef.current) {
              audioRef.current.src = track.src;
              audioRef.current.play().catch(e => console.log("Play failed", e));
          }
          setShowFullPlayer(true);
      }
  };

  const togglePlay = () => {
      if (audioRef.current) {
          if (audioRef.current.paused) {
              window.dispatchEvent(new Event('pause-bgm'));
              audioRef.current.play();
          } else {
              window.dispatchEvent(new Event('resume-bgm'));
              audioRef.current.pause();
          }
      }
  };

  return (
    <div>
      <h3 className={`text-xl font-bold mb-6 ${theme === 'night' ? 'text-slate-100' : 'text-slate-800'}`}>疗愈歌单</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {playlist.map((m, i) => (
          <div 
            key={i} 
            onClick={() => handlePlay(m)}
            className="aspect-square rounded-2xl relative group cursor-pointer overflow-hidden shadow-md"
          >
            <img src={m.cover} alt={m.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
               <Play className="w-12 h-12 text-white opacity-80 group-hover:scale-110 transition-transform" />
            </div>
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
              <h4 className="font-bold">{m.title}</h4>
              <p className="text-xs opacity-80">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <audio ref={audioRef} />

      {/* Full Screen Player Modal */}
      {showFullPlayer && currentTrack && (
          <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-white animate-fade-in">
              <button onClick={() => setShowFullPlayer(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full">
                  <X className="w-8 h-8" />
              </button>
              
              <div className="w-full max-w-md p-8 flex flex-col items-center">
                  <div className="w-72 h-72 rounded-3xl overflow-hidden shadow-2xl mb-8 border-4 border-white/10 relative">
                      <img src={currentTrack.cover} className="w-full h-full object-cover animate-spin-slow" style={{ animationDuration: '20s' }} />
                      <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
                  </div>
                  
                  <h2 className="text-3xl font-bold mb-2">{currentTrack.title}</h2>
                  <p className="text-slate-400 mb-12">{currentTrack.desc}</p>
                  
                  <div className="flex items-center gap-8">
                      <button className="p-4 hover:bg-white/10 rounded-full transition-colors"><Headphones className="w-6 h-6" /></button>
                      <button onClick={togglePlay} className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center hover:bg-teal-400 shadow-lg shadow-teal-500/50 transition-all transform hover:scale-105">
                          {audioRef.current && !audioRef.current.paused ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                      </button>
                      <button className="p-4 hover:bg-white/10 rounded-full transition-colors"><Maximize2 className="w-6 h-6" /></button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const AIChatSection = ({ onClose, theme }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '你好，我是AI心理抚慰师"安抚者"。如果你有什么心事，或者感到迷茫、焦虑，都可以告诉我。我会一直在这里倾听。' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { token } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:3000/api/chat/consult', { message: userMsg }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "抱歉，我稍微走神了一下，请再跟我说一次好吗？" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`rounded-3xl shadow-xl border h-[600px] flex flex-col relative overflow-hidden ${theme === 'night' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className={`p-4 text-white flex justify-between items-center shadow-md z-10 ${theme === 'night' ? 'bg-teal-900' : 'bg-teal-600'}`}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full"><Bot className="w-6 h-6" /></div>
                    <div>
                        <h3 className="font-bold">AI 安抚者</h3>
                        <p className="text-xs opacity-80 flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span> 在线</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${theme === 'night' ? 'bg-slate-900' : 'bg-slate-50'}`}>
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${
                            m.role === 'user' 
                            ? 'bg-teal-600 text-white rounded-tr-sm' 
                            : (theme === 'night' ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white text-slate-700 shadow-sm border border-slate-100') + ' rounded-tl-sm'
                        }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className={`p-4 rounded-2xl rounded-tl-sm shadow-sm border ${theme === 'night' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className={`p-4 border-t ${theme === 'night' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className="relative">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="在此输入你的心事..." 
                        className={`w-full pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 ${
                            theme === 'night' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200'
                        }`}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Healing;
