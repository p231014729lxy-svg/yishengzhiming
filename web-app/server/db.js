import { JSONFilePreset } from 'lowdb/node';

// Initialize LowDB
const defaultData = { 
  users: [], // { id, username, password, energy, inviteCode, invitedBy, createdAt }
  invitations: [], // { inviterId, inviteeId, timestamp }
  treeHollow: [
      {
          id: "seed1", userId: "system", username: "治愈小助手", isPublic: true, type: "image", title: "今天的晚霞好美", 
          content: "抬头看看天空，也许会有不一样的发现。生活总是充满了不期而遇的温柔。", 
          image: "https://images.unsplash.com/photo-1495616811223-4d98c6e9d869?q=80&w=1000&auto=format&fit=crop", 
          likes: 128, moodTags: ["感动", "治愈"], isAnonymous: false, timestamp: new Date().toISOString()
      },
      {
          id: "seed2", userId: "system", username: "匿名旅人", isPublic: true, type: "mood", title: "终于放下了", 
          content: "纠结了很久的事情，今天终于想通了。原来放过自己，才是最好的解脱。", 
          likes: 45, moodTags: ["释然"], isAnonymous: true, timestamp: new Date(Date.now() - 86400000).toISOString()
      },
      {
          id: "seed3", userId: "system", username: "心理咨询师", isPublic: true, type: "method", title: "3分钟呼吸法", 
          content: "当你感到焦虑时，试着闭上眼，深吸气4秒，屏息7秒，呼气8秒。重复三次，你会感觉好很多。", 
          likes: 342, moodTags: ["平静", "科普"], isAnonymous: false, timestamp: new Date(Date.now() - 172800000).toISOString()
      },
      {
          id: "seed4", userId: "system", username: "生活观察家", isPublic: true, type: "image", title: "路边的小花", 
          content: "即使在墙角，也要努力盛开。生命的力量，令人动容。", 
          image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=1000&auto=format&fit=crop", 
          likes: 89, moodTags: ["希望"], isAnonymous: false, timestamp: new Date(Date.now() - 200000).toISOString()
      }
  ], 
  moodDiaries: [], // { id, userId, mood, content, tags, timestamp }
  meditationRecords: [], // { id, userId, duration, type, timestamp }
  
  // Module 1: Memory & Memorial
  memoryStories: [], // { id, userId, title, content, type (text/voice), tags, contributors, timestamp }
  plantingDiaries: [], // { id, userId, mood, content, image, growthStage, timestamp }
  memorials: [], // { id, userId, name, bio, birthDate, deathDate, type (public/private), messages, flowers, timestamp }
  plantingAssistance: [], // { id, helperId, targetId, timestamp }
};

let db;

export async function initDB() {
  db = await JSONFilePreset('db.json', defaultData);
  
  // Ensure all collections exist (migration logic for existing db.json)
  db.data = { ...defaultData, ...db.data };
  if (!db.data.treeHollow) db.data.treeHollow = [];
  if (!db.data.moodDiaries) db.data.moodDiaries = [];
  if (!db.data.meditationRecords) db.data.meditationRecords = [];
  
  if (!db.data.memoryStories) db.data.memoryStories = [];
  if (!db.data.plantingDiaries) db.data.plantingDiaries = [];
  if (!db.data.memorials) db.data.memorials = [];
  if (!db.data.plantingAssistance) db.data.plantingAssistance = [];
  
  await db.write();
  return db;
}

export async function getDB() {
  if (!db) await initDB();
  return db;
}
