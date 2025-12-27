import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Globe, Send, MessageCircle, Heart, Book, X, Calendar, Clock, Image as ImageIcon, Sparkles, Smile, Plus, Mic, Video, FolderLock, ShieldAlert, Archive, User, Star, Trash2, StopCircle, Play } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TreeHollow = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('write'); // 'write', 'my', 'public'
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // New Features State
  const [moodTag, setMoodTag] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [timeCapsule, setTimeCapsule] = useState('none'); // 'none', '1m', '3m', '1y'
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedType, setSelectedType] = useState('mood'); // mood, method, image
  
  // Attachments
  const [attachments, setAttachments] = useState([]); // { type: 'image' | 'video', url: string, file: File }
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const [selectedPost, setSelectedPost] = useState(null);

  // Safety & Guidance
  const [showSafetyPrompt, setShowSafetyPrompt] = useState(false);

  const moodTags = ['思念', '迷茫', '平静', '释然', '焦虑', '感动'];

  // File Input Ref
  const fileInputRef = React.useRef(null);
  const videoInputRef = React.useRef(null);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleFileSelect = (e, type) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          setAttachments(prev => [...prev, { type, url: e.target.result, file }]);
      };
      reader.readAsDataURL(file);
  };

  const removeAttachment = (index) => {
      setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          const chunks = [];

          recorder.ondataavailable = (e) => chunks.push(e.data);
          recorder.onstop = () => {
              const blob = new Blob(chunks, { type: 'audio/webm' });
              const url = URL.createObjectURL(blob);
              setAudioBlob(blob);
              setAudioUrl(url);
              
              // Convert to Base64 for storage
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = () => {
                   // Store base64 if needed, for now we use blob for preview
              };
          };

          recorder.start();
          setMediaRecorder(recorder);
          setIsRecording(true);
      } catch (err) {
          alert("无法访问麦克风");
          console.error(err);
      }
  };

  const stopRecording = () => {
      if (mediaRecorder) {
          mediaRecorder.stop();
          setIsRecording(false);
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
  };

  const deleteAudio = () => {
      setAudioBlob(null);
      setAudioUrl(null);
  };

  useEffect(() => {
    if (activeTab !== 'write') {
      fetchPosts();
    }
  }, [activeTab]);

  // Safety Check
  useEffect(() => {
    const negativeKeywords = ['绝望', '不想活', '痛苦', '结束'];
    if (negativeKeywords.some(kw => content.includes(kw))) {
      setShowSafetyPrompt(true);
    } else {
      setShowSafetyPrompt(false);
    }
  }, [content]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/api/tree-hollow?type=${activeTab}`);
      setPosts(res.data);
    } catch (error) {
      console.error('Failed to fetch posts', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setShowTypeModal(true);
  };

  const confirmSubmit = async (isPublic) => {
    try {
      // Process attachments
      let image = null;
      let video = null;
      let audio = null;

      // Find first image/video in attachments
      const imgAttach = attachments.find(a => a.type === 'image');
      if (imgAttach) image = imgAttach.url;
      else if (selectedType === 'image') image = `https://picsum.photos/seed/${Date.now()}/400/300`;

      const vidAttach = attachments.find(a => a.type === 'video');
      if (vidAttach) video = vidAttach.url;

      if (audioBlob) {
          // Convert audio blob to base64 for storage (mock persistence)
          audio = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              reader.onloadend = () => resolve(reader.result);
          });
      }

      let scheduledTime = null;
      if (!isPublic && timeCapsule !== 'none') {
          const now = new Date();
          if (timeCapsule === '1m') now.setMonth(now.getMonth() + 1);
          if (timeCapsule === '3m') now.setMonth(now.getMonth() + 3);
          if (timeCapsule === '1y') now.setFullYear(now.getFullYear() + 1);
          scheduledTime = now.toISOString();
      }

      await axios.post('http://localhost:3000/api/tree-hollow', { 
        title, 
        content, 
        isPublic, 
        type: selectedType,
        image,
        video,
        audio,
        // New fields
        moodTags: moodTag ? [moodTag] : [],
        isAnonymous: isPublic ? isAnonymous : false, // Private is always personal
        scheduledTime // For Time Capsule
      });
      
      // Reset
      setContent('');
      setTitle('');
      setMoodTag('');
      setIsAnonymous(false);
      setTimeCapsule('none');
      setAttachments([]);
      setAudioBlob(null);
      setAudioUrl(null);
      setShowTypeModal(false);
      
      alert(isPublic ? '已发布到社区回响' : timeCapsule !== 'none' ? '时光信件已封存' : '已保存到我的秘密');
      setActiveTab(isPublic ? 'public' : 'my');
    } catch (error) {
      console.error('Failed to post', error);
      alert('发送失败，请重试');
    }
  };

  const handleLike = async (id) => {
    try {
      await axios.post(`http://localhost:3000/api/tree-hollow/${id}/like`);
      setPosts(posts.map(p => p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p));
    } catch (error) {
      console.error('Like failed', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 min-h-screen bg-[#fafafa]">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-serif font-bold text-slate-800 mb-4">心灵树洞</h2>
        <p className="text-slate-600">文字是情绪的容器，记录当下，治愈未来。</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-10 space-x-4 bg-white p-2 rounded-full shadow-sm w-fit mx-auto border border-slate-100">
        <TabButton active={activeTab === 'write'} onClick={() => setActiveTab('write')} icon={<Plus className="w-4 h-4" />}>
          发布
        </TabButton>
        <TabButton active={activeTab === 'my'} onClick={() => setActiveTab('my')} icon={<FolderLock className="w-4 h-4" />}>
          情感档案
        </TabButton>
        <TabButton active={activeTab === 'public'} onClick={() => setActiveTab('public')} icon={<Globe className="w-4 h-4" />}>
          社区回响
        </TabButton>
      </div>

      {/* Main Content Area */}
      <div className="relative min-h-[500px]">
        {/* Write Mode */}
        {activeTab === 'write' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-300 to-purple-300"></div>
              
              <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center justify-between">
                <span className="flex items-center"><Send className="w-5 h-5 mr-2 text-brand-500" /> 写给此刻的自己</span>
                <span className="text-xs text-slate-400 font-normal">支持文字 / 语音转写</span>
              </h3>

              <div className="space-y-4">
                 <input 
                   type="text" 
                   placeholder="加个标题吧 (可选)" 
                   className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-300 focus:ring-0 transition-all text-lg font-bold text-slate-800 placeholder-slate-400"
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                 />

                <div className="relative">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-64 p-6 pb-24 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-300 focus:bg-white focus:ring-0 transition-all resize-none text-slate-700 placeholder-slate-400 text-lg leading-relaxed"
                    placeholder="这一刻，你想说些什么？无论是喜悦、困惑还是秘密，树洞都在听..."
                  />
                  
                  {/* Media Preview Area */}
                  {(attachments.length > 0 || isRecording || audioUrl) && (
                      <div className="absolute bottom-16 left-6 right-6 flex gap-4 overflow-x-auto pb-2">
                          {/* Attachments */}
                          {attachments.map((file, idx) => (
                              <div key={idx} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 group">
                                  {file.type === 'image' ? (
                                      <img src={file.url} className="w-full h-full object-cover" />
                                  ) : (
                                      <video src={file.url} className="w-full h-full object-cover" />
                                  )}
                                  <button onClick={() => removeAttachment(idx)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <X className="w-3 h-3" />
                                  </button>
                              </div>
                          ))}

                          {/* Audio Recorder UI */}
                          {isRecording && (
                              <div className="h-20 flex items-center bg-red-50 text-red-600 px-4 rounded-xl border border-red-100 animate-pulse">
                                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-ping"></div>
                                  <span className="font-mono font-bold">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                                  <button onClick={stopRecording} className="ml-4 p-2 bg-white rounded-full shadow-sm hover:text-red-700">
                                      <StopCircle className="w-5 h-5" />
                                  </button>
                              </div>
                          )}

                          {/* Audio Preview */}
                          {!isRecording && audioUrl && (
                              <div className="h-20 flex items-center bg-brand-50 text-brand-700 px-4 rounded-xl border border-brand-100 relative group">
                                  <audio src={audioUrl} controls className="h-8 w-48" />
                                  <button onClick={deleteAudio} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Trash2 className="w-3 h-3" />
                                  </button>
                              </div>
                          )}
                      </div>
                  )}

                  {/* Media Tools */}
                  <div className="absolute bottom-4 left-4 flex space-x-2">
                    <button onClick={isRecording ? stopRecording : startRecording} className={`p-2 rounded-full border transition-all ${isRecording ? 'bg-red-500 text-white border-red-500' : 'bg-white border-slate-200 text-slate-500 hover:text-brand-500 hover:border-brand-300'}`} title="语音录制">
                        <Mic className="w-4 h-4" />
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-brand-500 hover:border-brand-300" title="添加图片"><ImageIcon className="w-4 h-4" /></button>
                    <button onClick={() => videoInputRef.current?.click()} className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-brand-500 hover:border-brand-300" title="添加视频"><Video className="w-4 h-4" /></button>
                    
                    {/* Hidden Inputs */}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'image')} />
                    <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={(e) => handleFileSelect(e, 'video')} />
                  </div>
                </div>

                {/* Mood Tags */}
                <div>
                  <label className="text-sm font-bold text-slate-600 mb-2 block">情绪标签</label>
                  <div className="flex flex-wrap gap-2">
                    {moodTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setMoodTag(tag === moodTag ? '' : tag)}
                        className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                          moodTag === tag 
                            ? 'bg-brand-100 text-brand-700 border border-brand-200' 
                            : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Safety Prompt */}
                <AnimatePresence>
                  {showSafetyPrompt && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start space-x-3 text-orange-800"
                    >
                      <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-bold">你似乎有些难过，愿意多说说吗？</p>
                        <p className="mt-1 opacity-90">这里的每个人都愿意倾听。如果你感到无法承受，请记得还有<a href="#" className="underline font-bold">专业心理援助</a>时刻在线。</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handlePreSubmit}
                  disabled={!content.trim()}
                  className={`px-10 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                    content.trim() 
                      ? 'bg-slate-800 hover:bg-slate-700 hover:shadow-slate-500/30' 
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  下一步
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* My Secrets (Archive Mode) */}
        {activeTab === 'my' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 gap-8"
          >
            {/* Filter / Search Bar Mock */}
            <div className="col-span-full flex justify-between items-center mb-4 px-2">
               <h3 className="font-bold text-slate-700">我的情感档案</h3>
               <div className="text-sm text-slate-500">加密文件夹 <Lock className="w-3 h-3 inline ml-1" /></div>
            </div>

            {loading ? (
              <div className="col-span-full text-center py-20 text-slate-400">正在翻阅档案...</div>
            ) : posts.length === 0 ? (
              <div className="col-span-full text-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                <Book className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>这里还是一片空白</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-[#fffcf9] p-8 rounded-tr-3xl rounded-bl-3xl rounded-tl-sm rounded-br-sm shadow-md border border-[#f0e6d2] hover:shadow-xl transition-all duration-300 relative group flex flex-col">
                  <div className="absolute top-4 right-4 text-slate-300 flex space-x-2">
                    {post.timeCapsule && post.timeCapsule !== 'none' && <Archive className="w-5 h-5 text-brand-400" title="时光胶囊" />}
                    <Lock className="w-5 h-5" />
                  </div>
                  
                  <div className="border-l-4 border-brand-200 pl-4 mb-4">
                    <div className="flex items-center text-slate-500 text-sm mb-1 font-serif">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(post.timestamp).toLocaleDateString()}
                    </div>
                    {post.moodTag && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-brand-50 text-brand-600 text-xs rounded-md">
                        #{post.moodTag}
                      </span>
                    )}
                  </div>

                  {post.title && <h3 className="font-bold text-xl text-slate-800 mb-3 font-serif">{post.title}</h3>}

                  <p className="text-slate-700 whitespace-pre-wrap leading-loose font-serif text-lg flex-grow">
                    {post.content}
                  </p>
                  
                  {post.image && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-[#f0e6d2]">
                      <img src={post.image} alt="Attachment" className="w-full h-auto object-cover" />
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Public Community */}
        {activeTab === 'public' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Topic Categories */}
            <div className="flex gap-3 overflow-x-auto pb-4 mb-6 custom-scrollbar">
               {['全部', '思念分享', '成长烦恼', '治愈感悟', '死亡认知'].map((topic, i) => (
                 <button key={i} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${i===0 ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                   {topic}
                 </button>
               ))}
            </div>

            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {loading ? (
                <div className="col-span-full text-center py-20 text-slate-400">加载回响中...</div>
              ) : posts.length === 0 ? (
                <div className="col-span-full text-center py-20 text-slate-400">
                  <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>暂时还没有公开的回响</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="break-inside-avoid bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group mb-4">
                    {/* Image Cover */}
                    {post.image ? (
                      <div className="w-full h-auto max-h-64 overflow-hidden relative">
                        <img src={post.image} alt="Post cover" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                          {post.type === 'image' ? '治愈画面' : post.type === 'method' ? '治愈方法' : '心情'}
                        </div>
                      </div>
                    ) : (
                      <div className={`w-full h-32 flex items-center justify-center ${
                        post.type === 'mood' ? 'bg-orange-50' : post.type === 'method' ? 'bg-blue-50' : 'bg-green-50'
                      } relative`}>
                        {post.type === 'mood' && <Smile className="w-10 h-10 text-orange-200" />}
                        {post.type === 'method' && <Sparkles className="w-10 h-10 text-blue-200" />}
                        <div className="absolute top-2 right-2 bg-white/50 text-slate-600 text-xs px-2 py-1 rounded-full">
                           {post.type === 'mood' ? '心情' : '治愈方法'}
                        </div>
                      </div>
                    )}

                    <div className="p-4">
                      <h4 className="font-bold text-slate-900 mb-2 line-clamp-2">{post.title || post.content.substring(0, 20)}</h4>
                      <p className="text-slate-600 text-sm line-clamp-3 mb-3 font-light">
                        {post.content}
                      </p>
                      
                      {post.moodTag && <span className="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md mb-3 inline-block">#{post.moodTag}</span>}

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-bold overflow-hidden">
                            {post.isAnonymous ? <User className="w-3 h-3" /> : post.username?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-xs text-slate-500 truncate max-w-[80px]">
                            {post.isAnonymous ? '匿名旅人' : post.username}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleLike(post.id)}
                          className="flex items-center space-x-1 text-slate-400 hover:text-red-500 transition-colors group/like"
                        >
                          <Heart className={`w-4 h-4 ${post.likes > 0 ? 'fill-red-500 text-red-500' : 'group-hover/like:text-red-500'}`} />
                          <span className="text-xs">{post.likes || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Type Selection Modal */}
      <AnimatePresence>
        {showTypeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative"
            >
              <button 
                onClick={() => setShowTypeModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold text-center text-slate-800 mb-6">选择发布方式</h3>

              {/* Type Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <TypeOption 
                  icon={<Smile className="w-6 h-6" />} 
                  label="心情" 
                  desc="记录喜怒哀乐" 
                  active={selectedType === 'mood'} 
                  onClick={() => setSelectedType('mood')}
                  color="bg-orange-100 text-orange-600"
                />
                <TypeOption 
                  icon={<Sparkles className="w-6 h-6" />} 
                  label="治愈方法" 
                  desc="分享解压小技巧" 
                  active={selectedType === 'method'} 
                  onClick={() => setSelectedType('method')}
                  color="bg-blue-100 text-blue-600"
                />
                <TypeOption 
                  icon={<ImageIcon className="w-6 h-6" />} 
                  label="治愈画面" 
                  desc="分享美好瞬间" 
                  active={selectedType === 'image'} 
                  onClick={() => setSelectedType('image')}
                  color="bg-green-100 text-green-600"
                />
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-6">
                {/* Private Section */}
                <div className="p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-all">
                   <div className="flex items-start mb-3">
                      <div className="p-2 bg-brand-100 text-brand-600 rounded-lg mr-3">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">私密保存</h4>
                        <p className="text-xs text-slate-500">仅自己可见，存入情感档案</p>
                      </div>
                   </div>
                   
                   <div className="ml-12 flex items-center space-x-2">
                      <span className="text-xs text-slate-500">时光胶囊:</span>
                      <select 
                        value={timeCapsule} 
                        onChange={(e) => setTimeCapsule(e.target.value)}
                        className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                      >
                        <option value="none">不设置</option>
                        <option value="1m">1个月后查看</option>
                        <option value="1y">1年后查看</option>
                      </select>
                   </div>
                   
                   <button 
                     onClick={() => confirmSubmit(false)}
                     className="mt-3 w-full py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700"
                   >
                     确认保存
                   </button>
                </div>

                {/* Public Section */}
                <div className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all">
                   <div className="flex items-start mb-3">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg mr-3">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">公开分享</h4>
                        <p className="text-xs text-slate-500">发布到社区，获得温暖回响</p>
                      </div>
                   </div>

                   <div className="ml-12 flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="anon" 
                        checked={isAnonymous} 
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="anon" className="text-xs text-slate-600">匿名发布 (显示为"匿名旅人")</label>
                   </div>

                   <button 
                     onClick={() => confirmSubmit(true)}
                     className="mt-3 w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700"
                   >
                     确认发布
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

const TypeOption = ({ icon, label, desc, active, onClick, color }) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center ${
      active ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
    }`}
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${color}`}>
      {icon}
    </div>
    <span className="font-bold text-slate-800 text-xs mb-0.5">{label}</span>
    <span className="text-[10px] text-slate-500">{desc}</span>
  </button>
);

const TabButton = ({ active, onClick, icon, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
      active 
        ? 'bg-slate-900 text-white shadow-md' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <span className="mr-2">{icon}</span>
    {children}
  </button>
);

export default TreeHollow;
