import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Sprout, Heart, Feather, Mic, Users, Plus, X, Calendar, Image as ImageIcon, HelpCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ModuleOne = () => {
  const [activeTab, setActiveTab] = useState('plantation'); // plantation, stories, memorial
  const { token, user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen bg-[#f7fdfb]">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-serif font-bold text-teal-900 mb-2">思念扎根，向生抽芽</h2>
        <p className="text-teal-700/70">让思念成为生命的养分，在这里种下希望。</p>
      </div>

      {/* Module Navigation */}
      <div className="flex justify-center gap-6 mb-12">
        <NavButton active={activeTab === 'plantation'} onClick={() => setActiveTab('plantation')} icon={<Sprout />} label="虚拟种植园" />
        <NavButton active={activeTab === 'stories'} onClick={() => setActiveTab('stories')} icon={<Book />} label="思念故事馆" />
        <NavButton active={activeTab === 'memorial'} onClick={() => setActiveTab('memorial')} icon={<Heart />} label="思念纪念册" />
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'plantation' && <VirtualPlantation token={token} user={user} />}
          {activeTab === 'stories' && <MemoryStoryHall token={token} />}
          {activeTab === 'memorial' && <MemorialAlbum token={token} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-6 py-3 rounded-full font-bold transition-all ${
      active 
        ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30' 
        : 'bg-white text-slate-500 hover:bg-teal-50 hover:text-teal-600'
    }`}
  >
    <span className="mr-2 w-5 h-5">{icon}</span>
    {label}
  </button>
);

/* --- Sub-Components --- */

const VirtualPlantation = ({ token, user }) => {
  const [energy, setEnergy] = useState(user?.energy || 0);
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAssistModal, setShowAssistModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false); // Quiz Modal State
  const [diaryContent, setDiaryContent] = useState('');
  const [growthStage, setGrowthStage] = useState(1); // 1: Seed, 2: Sprout, 3: Tree
  const [diaries, setDiaries] = useState([]);
  const [assistCode, setAssistCode] = useState('');

  // Quiz State
  const [quiz, setQuiz] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizResult, setQuizResult] = useState(null);

  // Sync local energy with user prop
  useEffect(() => {
    if (user) setEnergy(user.energy);
    if (user?.energy > 100) setGrowthStage(2);
    if (user?.energy > 300) setGrowthStage(3);
  }, [user]);

  // Fetch Diaries
  useEffect(() => {
      if (token) fetchDiaries();
  }, [token]);

  const fetchDiaries = async () => {
      try {
          const res = await axios.get('http://localhost:3000/api/module1/planting', {
             headers: { Authorization: `Bearer ${token}` }
          });
          setDiaries(res.data);
      } catch (e) {
          console.log("Fetch diaries failed or not implemented");
      }
  };

  const handleWater = async () => {
    try {
      const res = await axios.post('http://localhost:3000/api/energy/collect', { amount: 10 }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnergy(res.data.energy);
      alert("浇水成功！能量 +10");
    } catch (err) {
      console.error(err);
    }
  };

  // Quiz Logic
  const fetchQuiz = async () => {
      setShowQuizModal(true);
      setQuiz(null); // Loading state
      setSelectedOption(null);
      setQuizResult(null);
      try {
          const res = await axios.get('http://localhost:3000/api/quiz/daily', {
              headers: { Authorization: `Bearer ${token}` }
          });
          setQuiz(res.data);
      } catch (err) {
          alert("获取题目失败");
          setShowQuizModal(false);
      }
  };

  const submitQuiz = async () => {
      if (!selectedOption) return;
      const isCorrect = selectedOption === quiz.answer;
      
      if (isCorrect) {
          setQuizResult('correct');
          try {
              const res = await axios.post('http://localhost:3000/api/energy/collect', { amount: 20 }, {
                  headers: { Authorization: `Bearer ${token}` }
              });
              setEnergy(res.data.energy);
              // alert("回答正确！能量 +20");
          } catch (err) {
              console.error(err);
          }
      } else {
          setQuizResult('wrong');
      }
  };

  const submitDiary = async () => {
      try {
          await axios.post('http://localhost:3000/api/module1/planting', {
              mood: 'hopeful',
              content: diaryContent,
              growthStage
          }, { headers: { Authorization: `Bearer ${token}` }});
          setShowDiaryModal(false);
          setDiaryContent('');
          alert("种植日记已记录");
          fetchDiaries(); // Refresh list
      } catch (err) {
          alert("记录失败");
      }
  };

  const handleAssist = async () => {
      if (!assistCode) return;
      try {
          const res = await axios.post('http://localhost:3000/api/module1/assist', { inviteCode: assistCode }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          alert(`${res.data.message} 获得能量 +${res.data.energyAdded}`);
          setShowAssistModal(false);
          setAssistCode('');
          // Refresh user energy? 
          // Ideally trigger a user refresh, but we can just update local energy if returned
          setEnergy(prev => prev + res.data.energyAdded);
      } catch (err) {
          alert(err.response?.data?.message || "助力失败");
      }
  };

  return (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-teal-100 text-center relative overflow-hidden">
        <div className="absolute top-4 right-4 bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-bold">
            能量: {energy}
        </div>
        <div className="h-64 flex items-center justify-center relative">
             {/* Background Halo */}
             <div className={`absolute w-48 h-48 bg-teal-100 rounded-full blur-3xl transition-all duration-1000 ${growthStage > 1 ? 'scale-150 opacity-50' : 'scale-100 opacity-30'}`}></div>
             
             {/* Dynamic Plant Visualization */}
             <div className="relative z-10 transition-all duration-1000 transform hover:scale-110 cursor-pointer">
                 {growthStage === 1 && (
                     <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                        <Sprout className="w-32 h-32 text-teal-400" strokeWidth={1.5} />
                     </motion.div>
                 )}
                 {growthStage === 2 && (
                     <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <div className="relative">
                            <Sprout className="w-40 h-40 text-teal-600" strokeWidth={1.5} />
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-200 rounded-full animate-ping"></div>
                        </div>
                     </motion.div>
                 )}
                 {growthStage === 3 && (
                     <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                         <div className="text-[10rem] leading-none drop-shadow-2xl">🌳</div>
                     </motion.div>
                 )}
             </div>
        </div>
        <h3 className="text-3xl font-serif font-bold text-slate-800 mb-2">我的生命之树</h3>
        <p className="text-slate-500 mb-8">当前阶段: {growthStage === 1 ? '萌芽期' : growthStage === 2 ? '成长期' : '成熟期'}</p>
        
        <div className="flex justify-center gap-4">
            <button onClick={handleWater} className="px-8 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors">
                💧 浇水
            </button>
            <button onClick={() => setShowDiaryModal(true)} className="px-8 py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors">
                📔 种植日记
            </button>
            <button onClick={fetchQuiz} className="px-8 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-colors flex items-center">
                <HelpCircle className="w-4 h-4 mr-1" /> 答题
            </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
            <h4 className="font-bold text-orange-800 mb-2">亲友助力</h4>
            <p className="text-sm text-orange-700 mb-4">邀请亲友为你的植物浇水，传递温暖。首次助力可得30能量！</p>
            <div className="flex gap-3">
                <button onClick={() => setShowInviteModal(true)} className="flex-1 py-2 bg-white text-orange-600 rounded-lg font-bold text-sm border border-orange-200 hover:bg-orange-100">
                    生成邀请码
                </button>
                <button onClick={() => setShowAssistModal(true)} className="flex-1 py-2 bg-orange-500 text-white rounded-lg font-bold text-sm hover:bg-orange-600">
                    输入助力码
                </button>
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 max-h-[400px] overflow-y-auto custom-scrollbar">
            <h4 className="font-bold text-slate-800 mb-4">近期日记</h4>
            <div className="space-y-4">
                {diaries.length > 0 ? diaries.map(d => (
                    <div key={d.id} className="flex gap-3 text-sm text-slate-600 border-b border-slate-50 pb-2">
                        <span className="font-mono text-slate-400 whitespace-nowrap">{new Date(d.timestamp).toLocaleDateString()}</span>
                        <span className="line-clamp-2">{d.content}</span>
                    </div>
                )) : (
                    <p className="text-slate-400 text-sm">暂无种植日记</p>
                )}
            </div>
        </div>
      </div>

      {/* Diary Modal */}
      {showDiaryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">记录此刻的心情</h3>
                  <textarea 
                    className="w-full p-3 border border-slate-200 rounded-xl mb-4 h-32"
                    placeholder="写给植物，也写给自己..."
                    value={diaryContent}
                    onChange={e => setDiaryContent(e.target.value)}
                  ></textarea>
                  <div className="flex justify-end gap-3">
                      <button onClick={() => setShowDiaryModal(false)} className="px-4 py-2 text-slate-500">取消</button>
                      <button onClick={submitDiary} className="px-4 py-2 bg-teal-600 text-white rounded-lg">保存</button>
                  </div>
              </div>
          </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center">
                  <h3 className="text-xl font-bold mb-4 text-orange-800">邀请亲友助力</h3>
                  <div className="bg-orange-50 p-4 rounded-xl mb-4 border border-orange-100">
                      <p className="text-sm text-slate-500 mb-2">您的专属助力码</p>
                      <div className="text-3xl font-mono font-bold text-orange-600 tracking-widest">{user?.inviteCode || 'LOADING'}</div>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">对方输入此码，双方均可获得能量奖励</p>
                  <button onClick={() => setShowInviteModal(false)} className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg">关闭</button>
              </div>
          </div>
      )}

      {/* Assist Modal */}
      {showAssistModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl p-8 w-full max-w-sm">
                  <h3 className="text-xl font-bold mb-4 text-slate-800">输入好友助力码</h3>
                  <input 
                      type="text" 
                      placeholder="请输入6位邀请码" 
                      className="w-full p-3 border border-slate-200 rounded-xl mb-4 text-center font-mono text-lg uppercase"
                      value={assistCode}
                      onChange={e => setAssistCode(e.target.value.toUpperCase())}
                      maxLength={6}
                  />
                  <button onClick={handleAssist} className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold mb-2">确认助力</button>
                  <button onClick={() => setShowAssistModal(false)} className="w-full py-2 text-slate-400">取消</button>
              </div>
          </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl p-8 w-full max-w-md relative">
                  <button onClick={() => setShowQuizModal(false)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5"/></button>
                  <h3 className="text-2xl font-bold mb-6 text-purple-800 text-center">每日知识能量</h3>
                  
                  {!quiz ? (
                      <div className="text-center py-8">
                          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-slate-500">正在生成题目...</p>
                      </div>
                  ) : (
                      <>
                          <p className="text-lg font-bold text-slate-800 mb-6">{quiz.question}</p>
                          <div className="space-y-3 mb-6">
                              {quiz.options.map((opt, i) => {
                                  const letter = opt[0]; // 'A'
                                  const isSelected = selectedOption === letter;
                                  let btnClass = "w-full text-left p-4 rounded-xl border transition-all ";
                                  
                                  if (quizResult) {
                                      if (letter === quiz.answer) btnClass += "bg-green-100 border-green-300 text-green-800";
                                      else if (isSelected && letter !== quiz.answer) btnClass += "bg-red-100 border-red-300 text-red-800";
                                      else btnClass += "bg-slate-50 border-slate-100 opacity-50";
                                  } else {
                                      if (isSelected) btnClass += "bg-purple-50 border-purple-300 text-purple-800";
                                      else btnClass += "bg-white border-slate-200 hover:bg-slate-50";
                                  }

                                  return (
                                      <button 
                                        key={i} 
                                        disabled={!!quizResult}
                                        onClick={() => setSelectedOption(letter)}
                                        className={btnClass}
                                      >
                                          {opt}
                                      </button>
                                  );
                              })}
                          </div>
                          
                          {quizResult ? (
                              <div className="text-center">
                                  {quizResult === 'correct' ? (
                                      <div className="text-green-600 font-bold mb-4">🎉 回答正确！能量 +20</div>
                                  ) : (
                                      <div className="text-red-500 font-bold mb-4">😢 回答错误，正确答案是 {quiz.answer}</div>
                                  )}
                                  <button onClick={() => setShowQuizModal(false)} className="px-6 py-2 bg-slate-800 text-white rounded-full">关闭</button>
                              </div>
                          ) : (
                              <button 
                                onClick={submitQuiz}
                                disabled={!selectedOption}
                                className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
                              >
                                提交答案
                              </button>
                          )}
                      </>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

const MemoryStoryHall = ({ token }) => {
    const [stories, setStories] = useState([]);
    const [isWriting, setIsWriting] = useState(false);
    const [newStory, setNewStory] = useState({ title: '', content: '', tags: [] });

    useEffect(() => {
        if (token) fetchStories();
    }, [token]);

    const fetchStories = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/module1/story', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStories(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePublish = async () => {
        try {
            await axios.post('http://localhost:3000/api/module1/story', newStory, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsWriting(false);
            setNewStory({ title: '', content: '', tags: [] });
            fetchStories();
            alert("故事已收录");
        } catch (err) {
            alert("发布失败");
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {!isWriting ? (
                <>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">思念故事集</h3>
                            <p className="text-slate-500">记录那些闪闪发光的温暖瞬间</p>
                        </div>
                        <button onClick={() => setIsWriting(true)} className="flex items-center px-6 py-3 bg-teal-600 text-white rounded-full font-bold shadow-lg hover:bg-teal-700">
                            <Feather className="w-4 h-4 mr-2" /> 书写故事
                        </button>
                    </div>

                    <div className="grid gap-6">
                        {stories.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <Book className="w-12 h-12 mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400">还没有收录故事，去写下第一个吧</p>
                            </div>
                        ) : (
                            stories.map(story => (
                                <div key={story.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-xl font-bold text-slate-800">{story.title}</h4>
                                        <span className="text-xs text-slate-400">{new Date(story.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-slate-600 line-clamp-3 mb-4">{story.content}</p>
                                    <div className="flex gap-2">
                                        {story.tags.map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-slate-50 text-slate-500 text-xs rounded-md">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : (
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">撰写思念故事</h3>
                        <button onClick={() => setIsWriting(false)}><X className="w-6 h-6 text-slate-400" /></button>
                    </div>
                    <div className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="故事标题" 
                            className="w-full text-lg font-bold p-3 border-b border-slate-200 focus:border-teal-500 outline-none"
                            value={newStory.title}
                            onChange={e => setNewStory({...newStory, title: e.target.value})}
                        />
                        <textarea 
                            className="w-full h-64 p-3 bg-slate-50 rounded-xl resize-none outline-none focus:ring-2 focus:ring-teal-100"
                            placeholder="写下你的思念..."
                            value={newStory.content}
                            onChange={e => setNewStory({...newStory, content: e.target.value})}
                        ></textarea>
                        
                        <div className="flex gap-2 items-center">
                            <span className="text-sm text-slate-500">标签:</span>
                            {['童年回忆', '温暖瞬间', '未说的话'].map(tag => (
                                <button 
                                    key={tag}
                                    onClick={() => {
                                        const tags = newStory.tags.includes(tag) 
                                            ? newStory.tags.filter(t => t !== tag)
                                            : [...newStory.tags, tag];
                                        setNewStory({...newStory, tags});
                                    }}
                                    className={`px-3 py-1 rounded-full text-sm border ${
                                        newStory.tags.includes(tag) ? 'bg-teal-50 border-teal-200 text-teal-700' : 'border-slate-200 text-slate-500'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4">
                             <button className="mr-4 text-slate-500 flex items-center"><Mic className="w-4 h-4 mr-1"/> 录制语音</button>
                             <button onClick={handlePublish} className="px-8 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700">发布</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MemorialAlbum = ({ token }) => {
    const [memorials, setMemorials] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: '', bio: '', birthDate: '', deathDate: '' });

    useEffect(() => {
        if (token) fetchMemorials();
    }, [token]);

    const fetchMemorials = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/module1/memorial', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMemorials(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async () => {
        try {
            await axios.post('http://localhost:3000/api/module1/memorial', form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowCreate(false);
            setForm({ name: '', bio: '', birthDate: '', deathDate: '' });
            fetchMemorials();
        } catch (err) {
            alert("创建失败");
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
             <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">数字思念纪念馆</h3>
                    <p className="text-slate-500">永久留存的爱与记忆</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="px-6 py-3 bg-slate-800 text-white rounded-full font-bold shadow-lg hover:bg-slate-700">
                    创建纪念碑
                </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {memorials.map(m => (
                    <div key={m.id} className="bg-white rounded-t-full p-8 pt-12 shadow-md border border-slate-100 text-center relative group hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-24 h-24 mx-auto bg-slate-200 rounded-full mb-4 overflow-hidden border-4 border-white shadow-sm">
                             {/* Placeholder for avatar */}
                             <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                                 <Users />
                             </div>
                        </div>
                        <h4 className="text-xl font-serif font-bold text-slate-800">{m.name}</h4>
                        <p className="text-sm text-slate-500 mb-4">{m.birthDate} - {m.deathDate}</p>
                        <p className="text-slate-600 text-sm line-clamp-2 mb-6 italic">"{m.bio}"</p>
                        
                        <div className="border-t border-slate-100 pt-4 flex justify-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center"><Heart className="w-4 h-4 mr-1 text-red-400" /> {m.flowers || 0}</span>
                            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> 纪念日</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-lg">
                        <h3 className="text-2xl font-bold mb-6 text-center font-serif">创建虚拟纪念碑</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="逝者姓名" className="w-full p-3 border rounded-xl" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                            <textarea placeholder="生平简介 / 纪念寄语" className="w-full p-3 border rounded-xl h-24" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}></textarea>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">出生日期</label>
                                    <input type="date" className="w-full p-3 border rounded-xl" value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">离世日期</label>
                                    <input type="date" className="w-full p-3 border rounded-xl" value={form.deathDate} onChange={e => setForm({...form, deathDate: e.target.value})} />
                                </div>
                            </div>
                            <button onClick={handleCreate} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold mt-4">确认创建</button>
                            <button onClick={() => setShowCreate(false)} className="w-full py-2 text-slate-500">取消</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModuleOne;
