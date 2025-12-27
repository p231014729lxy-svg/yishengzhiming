import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Battery, Zap, Share2, HelpCircle, CheckCircle, XCircle, Copy, Sun, Cloud, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Online = () => {
  const navigate = useNavigate();
  const { user, updateUserEnergy } = useAuth();
  const [energy, setEnergy] = useState(user?.energy || 0);
  const [isCollecting, setIsCollecting] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizResult, setQuizResult] = useState(null); 
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) setEnergy(user.energy);
  }, [user]);

  const handleCollect = async () => {
    setIsCollecting(true);
    try {
      const res = await axios.post('http://localhost:3000/api/energy/collect', { amount: 10 });
      setEnergy(res.data.energy);
      updateUserEnergy(res.data.energy);
    } catch (error) {
      console.error('Failed to collect energy', error);
    } finally {
      setTimeout(() => setIsCollecting(false), 1000);
    }
  };

  const loadQuiz = async () => {
    if (quiz) return;
    setQuizLoading(true);
    try {
      const res = await axios.get('http://localhost:3000/api/quiz/daily');
      setQuiz(res.data);
    } catch (error) {
      console.error('Failed to load quiz', error);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizSubmit = (option) => {
    setSelectedOption(option);
    const isCorrect = option.startsWith(quiz.answer);
    setQuizResult(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
       axios.post('http://localhost:3000/api/energy/collect', { amount: 20 })
        .then(res => {
          setEnergy(res.data.energy);
          updateUserEnergy(res.data.energy);
        });
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(user?.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 min-h-screen">
      <div className="flex items-center justify-between mb-12">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 flex items-center">
             <Sun className="w-8 h-8 text-orange-400 mr-3" />
             线上守护
           </h2>
           <p className="text-slate-500 mt-2">今天是充满希望的一天，收集能量温暖世界。</p>
        </div>
        <div className="bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100 flex items-center space-x-2">
           <Cloud className="w-5 h-5 text-blue-400" />
           <span className="text-slate-600 font-medium">今日空气质量: 优</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Energy Core */}
        <div className="lg:col-span-5">
           <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl border border-white/50 p-8 flex flex-col items-center justify-center h-full min-h-[500px] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-300 to-brand-500"></div>
            
            <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
              {/* Outer Glow */}
              <div className="absolute inset-0 rounded-full bg-brand-50 blur-3xl opacity-50"></div>
              
              <div className="absolute inset-0 rounded-full border-[12px] border-slate-50"></div>
              <div 
                className="absolute inset-0 rounded-full border-[12px] border-brand-500 border-t-transparent transition-all duration-1000 ease-out" 
                style={{ transform: `rotate(${energy % 360}deg)` }}
              ></div>
              
              <div className="flex flex-col items-center z-10">
                <Battery className="w-8 h-8 text-brand-500 mb-2" />
                <span className="text-6xl font-bold text-slate-800">{energy}</span>
                <span className="text-xs text-slate-400 uppercase tracking-widest mt-2">Energy Points</span>
              </div>
            </div>

            <button 
              onClick={handleCollect}
              disabled={isCollecting}
              className={`w-full max-w-xs py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2 shadow-lg
                ${isCollecting 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:shadow-brand-500/30'
                }`}
            >
              {isCollecting ? (
                <>
                  <Zap className="w-5 h-5 animate-pulse" />
                  <span>能量汇聚中...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>点击收集能量</span>
                </>
              )}
            </button>
            
            <p className="mt-6 text-xs text-slate-400 text-center max-w-[200px]">
              每收集 100 能量，可为干旱地区捐赠 1 瓶水
            </p>
          </motion.div>
        </div>

        {/* Right Column: Tasks */}
        <div className="lg:col-span-7 space-y-6">
          {/* Daily Quiz Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-xl text-slate-800 flex items-center">
                  <HelpCircle className="w-6 h-6 mr-3 text-purple-500" />
                  每日健康问答
                </h3>
                <p className="text-sm text-slate-500 mt-1">AI 生成个性化题目，涨知识，得能量。</p>
              </div>
              {!quiz && !quizResult && (
                <button 
                  onClick={loadQuiz}
                  disabled={quizLoading}
                  className="px-6 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-bold hover:bg-purple-100 transition-colors"
                >
                  {quizLoading ? 'AI 生成中...' : '开始挑战'}
                </button>
              )}
            </div>

            {quiz && (
              <div className="mt-6 space-y-3 bg-slate-50 p-6 rounded-2xl">
                <p className="font-medium text-lg text-slate-800 mb-4">{quiz.question}</p>
                <div className="space-y-3">
                  {quiz.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => !quizResult && handleQuizSubmit(option)}
                      disabled={!!quizResult}
                      className={`w-full text-left p-4 rounded-xl text-sm transition-all border-2 ${
                        selectedOption === option
                          ? quizResult === 'correct' 
                            ? 'bg-green-50 border-green-400 text-green-700'
                            : 'bg-red-50 border-red-400 text-red-700'
                          : 'border-transparent bg-white hover:border-brand-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-base">{option}</span>
                        {selectedOption === option && (
                          quizResult === 'correct' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {quizResult === 'correct' && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center text-green-600 mt-4 font-bold bg-green-50 p-3 rounded-lg">
                     <Zap className="w-4 h-4 mr-2" />
                     回答正确！获得 +20 能量
                   </motion.div>
                )}
              </div>
            )}
          </motion.div>

          {/* Invitation Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl shadow-lg text-white relative overflow-hidden"
          >
             <div className="relative z-10 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-xl mb-2">邀请好友助力</h3>
                <p className="text-indigo-100 max-w-sm">邀请好友加入守护计划，双方均可获得 50 能量奖励，共同治愈地球。</p>
                
                <div className="mt-6 flex items-center space-x-3">
                  <button 
                    onClick={() => setShowInvite(!showInvite)}
                    className="px-6 py-2 bg-white text-indigo-600 rounded-full text-sm font-bold hover:bg-indigo-50 flex items-center transition-colors shadow-md"
                  >
                    <Share2 className="w-4 h-4 mr-2" /> 
                    {showInvite ? '收起邀请码' : '获取邀请码'}
                  </button>
                </div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                 <Share2 className="w-8 h-8 text-white" />
              </div>
            </div>
            
            {showInvite && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-6 bg-black/20 p-4 rounded-2xl backdrop-blur-md"
              >
                <div className="flex items-center space-x-3">
                  <code className="flex-1 bg-white/10 p-3 rounded-xl border border-white/20 font-mono text-center text-2xl font-bold tracking-[0.2em]">
                    {user?.inviteCode || 'LOADING'}
                  </code>
                  <button 
                    onClick={copyInviteCode}
                    className="p-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors"
                  >
                    {copied ? <CheckCircle className="w-6 h-6 text-green-300" /> : <Copy className="w-6 h-6 text-white" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Decor */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Online;
