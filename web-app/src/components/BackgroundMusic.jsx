import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

// Map 12 Chinese Zodiac Hours (Shichen) to files
// Zi (23-1), Chou (1-3), Yin (3-5), Mao (5-7), Chen (7-9), Si (9-11)
// Wu (11-13), Wei (13-15), Shen (15-17), You (17-19), Xu (19-21), Hai (21-23)
const shichenMap = [
  { name: '子时', file: 'zi.mp3', time: '23:00-01:00', desc: '夜半 · 潜龙勿用' },
  { name: '丑时', file: 'chou.mp3', time: '01:00-03:00', desc: '鸡鸣 · 养精蓄锐' },
  { name: '寅时', file: 'yin.mp3', time: '03:00-05:00', desc: '平旦 · 黎明破晓' },
  { name: '卯时', file: 'mao.mp3', time: '05:00-07:00', desc: '日出 · 朝气蓬勃' },
  { name: '辰时', file: 'chen.mp3', time: '07:00-09:00', desc: '食时 · 万物复苏' },
  { name: '巳时', file: 'si.mp3', time: '09:00-11:00', desc: '隅中 · 精神饱满' },
  { name: '午时', file: 'wu.mp3', time: '11:00-13:00', desc: '日中 · 阳气最盛' },
  { name: '未时', file: 'wei.mp3', time: '13:00-15:00', desc: '日昳 · 悠然自得' },
  { name: '申时', file: 'shen.mp3', time: '15:00-17:00', desc: '哺时 · 且听风吟' },
  { name: '酉时', file: 'you.mp3', time: '17:00-19:00', desc: '日入 · 倦鸟归林' },
  { name: '戌时', file: 'xu.mp3', time: '19:00-21:00', desc: '黄昏 · 灯火阑珊' },
  { name: '亥时', file: 'hai.mp3', time: '21:00-23:00', desc: '人定 · 岁月静好' },
];

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentShichen, setCurrentShichen] = useState(0);
  const audioRef = useRef(null);

  // Calculate current Shichen
  const getShichenIndex = () => {
    const hour = new Date().getHours();
    // (Hour + 1) / 2 floor mod 12
    // 23 -> 24/2 = 12%12 = 0 (Zi)
    // 0 -> 1/2 = 0 (Zi)
    // 1 -> 2/2 = 1 (Chou)
    return Math.floor((hour + 1) / 2) % 12;
  };

  useEffect(() => {
    const idx = getShichenIndex();
    setCurrentShichen(idx);
    
    // Set initial source
    if (audioRef.current) {
      audioRef.current.src = `/src/musics/twelve_hours/${shichenMap[idx].file}`;
      audioRef.current.volume = 0.05; // Even lower volume
      
      // Auto play attempt
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
          playPromise.then(() => {
              setIsPlaying(true);
          }).catch(error => {
              console.log("Auto-play prevented by browser policy");
          });
      }
    }

    // Check time every minute
    const timer = setInterval(() => {
      const newIdx = getShichenIndex();
      if (newIdx !== currentShichen) {
        setCurrentShichen(newIdx);
        if (audioRef.current) {
          const wasPlaying = !audioRef.current.paused;
          audioRef.current.src = `/src/musics/twelve_hours/${shichenMap[newIdx].file}`;
          if (wasPlaying) audioRef.current.play().catch(() => {});
        }
      }
    }, 60000);

    // Event Listeners for global conflict management
    const handlePauseBGM = () => {
        if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
            setIsPlaying(false);
            // We don't change state manually to 'stopped' per se, we just pause
            // But to resume correctly, we might need to know if it WAS playing.
            // For simplicity, resume always tries to play if user hasn't explicitly muted?
            // Let's just pause.
        }
    };

    const handleResumeBGM = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(() => {});
            setIsPlaying(true);
        }
    };

    window.addEventListener('pause-bgm', handlePauseBGM);
    window.addEventListener('resume-bgm', handleResumeBGM);

    return () => {
        clearInterval(timer);
        window.removeEventListener('pause-bgm', handlePauseBGM);
        window.removeEventListener('resume-bgm', handleResumeBGM);
    };
  }, [currentShichen]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const info = shichenMap[currentShichen];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 animate-fade-in-up">
      <div className={`bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50 flex items-center gap-3 transition-all duration-500 ${isPlaying ? 'w-auto opacity-100' : 'w-0 opacity-0 px-0 overflow-hidden'}`}>
         <div className="flex flex-col text-right min-w-[80px]">
            <span className="text-xs font-bold text-slate-800">{info.name}</span>
            <span className="text-[10px] text-slate-500 whitespace-nowrap">{info.desc}</span>
         </div>
         <div className="h-6 w-[1px] bg-slate-200"></div>
      </div>

      <button 
        onClick={togglePlay}
        className={`relative group p-4 rounded-full shadow-xl transition-all duration-300 ${
            isPlaying 
            ? 'bg-slate-800 text-white rotate-0' 
            : 'bg-white text-slate-600 hover:scale-110 hover:text-slate-900'
        }`}
        title={isPlaying ? "暂停" : "播放十二时辰疗愈音"}
      >
        {isPlaying ? (
           <Volume2 className="w-6 h-6" />
        ) : (
           <Music className="w-6 h-6" />
        )}
        
        {/* Ripple effect when playing */}
        {isPlaying && (
            <span className="absolute -inset-1 rounded-full border border-slate-800/30 animate-ping"></span>
        )}
      </button>

      <audio ref={audioRef} loop />
    </div>
  );
};

export default BackgroundMusic;
