import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { getDB } from './db.js';
import { nanoid } from 'nanoid';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// DeepSeek Client (OpenAI Compatible)
const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---

app.post('/api/register', async (req, res) => {
  const { username, password, inviteCode } = req.body;
  const db = await getDB();

  const existingUser = db.data.users.find(u => u.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const myInviteCode = nanoid(6); // Generate short unique code

  const newUser = {
    id: nanoid(),
    username,
    password: hashedPassword,
    energy: 0,
    inviteCode: myInviteCode,
    invitedBy: null,
    createdAt: new Date().toISOString()
  };

  // Handle Invitation Logic
  if (inviteCode) {
    const inviter = db.data.users.find(u => u.inviteCode === inviteCode);
    if (inviter) {
      newUser.invitedBy = inviter.id;
      inviter.energy += 50; // Bonus for inviter
      newUser.energy += 20; // Bonus for new user
      
      db.data.invitations.push({
        inviterId: inviter.id,
        inviteeId: newUser.id,
        timestamp: new Date().toISOString()
      });
    }
  }

  db.data.users.push(newUser);
  await db.write();

  const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET);
  res.json({ token, user: { id: newUser.id, username: newUser.username, energy: newUser.energy, inviteCode: newUser.inviteCode } });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const db = await getDB();

  const user = db.data.users.find(u => u.username === username);
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, energy: user.energy, inviteCode: user.inviteCode } });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/me', authenticateToken, async (req, res) => {
  const db = await getDB();
  const user = db.data.users.find(u => u.id === req.user.id);
  if (user) {
    res.json({ id: user.id, username: user.username, energy: user.energy, inviteCode: user.inviteCode });
  } else {
    res.sendStatus(404);
  }
});

// --- Feature Routes ---

app.post('/api/energy/collect', authenticateToken, async (req, res) => {
  const { amount } = req.body;
  const db = await getDB();
  const user = db.data.users.find(u => u.id === req.user.id);
  
  if (user) {
    user.energy += amount || 10;
    await db.write();
    res.json({ energy: user.energy });
  } else {
    res.sendStatus(404);
  }
});

app.get('/api/quiz/daily', authenticateToken, async (req, res) => {
  try {
    const completion = await deepseek.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful health assistant. Generate a single multiple-choice health or environmental question in Chinese JSON format: { question: '...', options: ['A...', 'B...', 'C...', 'D...'], answer: 'A' }" },
        { role: "user", content: "Generate a new daily health question." }
      ],
      model: "deepseek-chat",
      response_format: { type: "json_object" }
    });

    const quizContent = JSON.parse(completion.choices[0].message.content);
    res.json(quizContent);
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    // Fallback quiz if API fails
    res.json({
      question: "以下哪种行为最有助于减少碳排放？",
      options: ["A. 经常使用一次性餐具", "B. 乘坐公共交通出行", "C. 无论远近都开车", "D. 即使不需要也一直开灯"],
      answer: "B"
    });
  }
});

// --- Tree Hollow Routes ---

// Increase JSON payload limit for base64 images/audio
app.use(express.json({ limit: '50mb' }));

app.post('/api/tree-hollow', authenticateToken, async (req, res) => {
  const { content, isPublic, type, title, image, video, audio, moodTags, isAnonymous, scheduledTime } = req.body;
  const db = await getDB();
  
  if (!db.data.treeHollow) {
      db.data.treeHollow = [];
  }

  const newPost = {
    id: nanoid(),
    userId: req.user.id,
    username: req.user.username,
    content,
    isPublic: !!isPublic,
    type: type || 'mood', // mood, method, image
    title: title || '',
    image: image || '', // URL or null
    video: video || '',
    audio: audio || '',
    likes: 0,
    moodTags: moodTags || [],
    isAnonymous: !!isAnonymous,
    scheduledTime: scheduledTime || null, // For Time Capsule
    timestamp: new Date().toISOString()
  };

  db.data.treeHollow.push(newPost);
  await db.write();
  res.json(newPost);
});

app.get('/api/tree-hollow', authenticateToken, async (req, res) => {
  const db = await getDB();
  const { type } = req.query; // 'my' or 'public'
  
  // Ensure array exists
  if (!db.data.treeHollow) {
      db.data.treeHollow = [];
      await db.write();
  }

  let posts = [];
  const now = new Date();

  if (type === 'my') {
    posts = db.data.treeHollow.filter(post => post.userId === req.user.id);
  } else {
    // Public posts: must be public AND (not scheduled OR scheduled time has passed)
    posts = db.data.treeHollow.filter(post => {
      if (!post.isPublic) return false;
      if (post.scheduledTime && new Date(post.scheduledTime) > now) return false;
      return true;
    });
  }
  
  // Sort by newest first
  posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  res.json(posts);
});

app.post('/api/tree-hollow/:id/like', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const db = await getDB();
  const post = db.data.treeHollow.find(p => p.id === id);
  
  if (post) {
    post.likes = (post.likes || 0) + 1;
    await db.write();
    res.json({ likes: post.likes });
  } else {
    res.sendStatus(404);
  }
});

// --- Healing Space Routes ---

// Mood Diary
app.post('/api/healing/mood', authenticateToken, async (req, res) => {
  const { mood, content, tags } = req.body;
  const db = await getDB();

  if (!db.data.moodDiaries) db.data.moodDiaries = [];

  const newEntry = {
    id: nanoid(),
    userId: req.user.id,
    mood,
    content,
    tags: tags || [],
    timestamp: new Date().toISOString()
  };

  db.data.moodDiaries.push(newEntry);
  await db.write();
  res.json(newEntry);
});

app.get('/api/healing/mood', authenticateToken, async (req, res) => {
  const db = await getDB();
  if (!db.data.moodDiaries) db.data.moodDiaries = [];
  
  const entries = db.data.moodDiaries
    .filter(e => e.userId === req.user.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
  res.json(entries);
});

// Meditation Records
app.post('/api/healing/meditation', authenticateToken, async (req, res) => {
  const { duration, type } = req.body;
  const db = await getDB();

  if (!db.data.meditationRecords) db.data.meditationRecords = [];

  const record = {
    id: nanoid(),
    userId: req.user.id,
    duration: duration || 0, // in minutes
    type: type || 'guided',
    timestamp: new Date().toISOString()
  };

  db.data.meditationRecords.push(record);
  await db.write();
  res.json(record);
});

// --- Module 1: Memory & Memorial Routes ---

// Memory Stories
app.post('/api/module1/story', authenticateToken, async (req, res) => {
  const { title, content, type, tags, contributors } = req.body;
  const db = await getDB();

  if (!db.data.memoryStories) db.data.memoryStories = [];

  const newStory = {
    id: nanoid(),
    userId: req.user.id,
    title,
    content,
    type: type || 'text', // text or voice
    tags: tags || [],
    contributors: contributors || [],
    timestamp: new Date().toISOString()
  };

  db.data.memoryStories.push(newStory);
  await db.write();
  res.json(newStory);
});

app.get('/api/module1/story', authenticateToken, async (req, res) => {
  const db = await getDB();
  if (!db.data.memoryStories) db.data.memoryStories = [];
  
  const stories = db.data.memoryStories
    .filter(s => s.userId === req.user.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
  res.json(stories);
});

// Memorials
app.post('/api/module1/memorial', authenticateToken, async (req, res) => {
  const { name, bio, birthDate, deathDate, type, flowers } = req.body;
  const db = await getDB();

  if (!db.data.memorials) db.data.memorials = [];

  const newMemorial = {
    id: nanoid(),
    userId: req.user.id,
    name,
    bio,
    birthDate,
    deathDate,
    type: type || 'private',
    messages: [],
    flowers: flowers || 0,
    timestamp: new Date().toISOString()
  };

  db.data.memorials.push(newMemorial);
  await db.write();
  res.json(newMemorial);
});

app.get('/api/module1/memorial', authenticateToken, async (req, res) => {
  const db = await getDB();
  if (!db.data.memorials) db.data.memorials = [];
  
  const memorials = db.data.memorials
    .filter(m => m.userId === req.user.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
  res.json(memorials);
});

// Planting Assistance (Invitation Code)
app.post('/api/module1/assist', authenticateToken, async (req, res) => {
  const { inviteCode } = req.body;
  const db = await getDB();
  
  if (!db.data.plantingAssistance) db.data.plantingAssistance = [];

  // Find Target User
  const targetUser = db.data.users.find(u => u.inviteCode === inviteCode);
  if (!targetUser) {
    return res.status(404).json({ message: "无效的邀请码" });
  }
  
  if (targetUser.id === req.user.id) {
    return res.status(400).json({ message: "不能助力自己哦" });
  }

  // Check if already assisted this user
  const existingAssist = db.data.plantingAssistance.find(a => a.helperId === req.user.id && a.targetId === targetUser.id);
  if (existingAssist) {
    return res.status(400).json({ message: "您已经助力过这位朋友啦" });
  }

  // Check if first time assisting ANYONE (for +30 bonus)
  const hasAssistedAnyone = db.data.plantingAssistance.some(a => a.helperId === req.user.id);
  const helperBonus = hasAssistedAnyone ? 5 : 30; // 30 for first time, 5 for subsequent

  // Update Energy
  targetUser.energy += 10; // Target gets 10
  
  const currentUser = db.data.users.find(u => u.id === req.user.id);
  currentUser.energy += helperBonus;

  // Record Assistance
  db.data.plantingAssistance.push({
    id: nanoid(),
    helperId: req.user.id,
    targetId: targetUser.id,
    timestamp: new Date().toISOString()
  });

  await db.write();

  res.json({ 
    message: "助力成功！", 
    energyAdded: helperBonus, 
    firstTimeBonus: !hasAssistedAnyone 
  });
});

// Planting Diaries (Extension of Energy/Virtual Plantation)
app.post('/api/module1/planting', authenticateToken, async (req, res) => {
  const { mood, content, growthStage } = req.body;
  const db = await getDB();

  if (!db.data.plantingDiaries) db.data.plantingDiaries = [];

  const diary = {
    id: nanoid(),
    userId: req.user.id,
    mood,
    content,
    growthStage,
    timestamp: new Date().toISOString()
  };

  db.data.plantingDiaries.push(diary);
  await db.write();
  res.json(diary);
});

app.get('/api/module1/planting', authenticateToken, async (req, res) => {
  const db = await getDB();
  if (!db.data.plantingDiaries) db.data.plantingDiaries = [];
  
  const diaries = db.data.plantingDiaries
    .filter(d => d.userId === req.user.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
  res.json(diaries);
});

// User Growth Stats (Updated with Module 1 data)
app.get('/api/user/growth', authenticateToken, async (req, res) => {
  const db = await getDB();
  const userId = req.user.id;
  const user = db.data.users.find(u => u.id === userId);

  if (!user) return res.sendStatus(404);

  const treeHollowPosts = (db.data.treeHollow || []).filter(p => p.userId === userId).length;
  const moodEntries = (db.data.moodDiaries || []).filter(m => m.userId === userId).length;
  const meditationSessions = (db.data.meditationRecords || []).filter(m => m.userId === userId);
  const totalMeditationTime = meditationSessions.reduce((acc, curr) => acc + curr.duration, 0);
  
  // New Stats
  const memoryStories = (db.data.memoryStories || []).filter(s => s.userId === userId).length;
  const memorials = (db.data.memorials || []).filter(m => m.userId === userId).length;

  const daysActive = Math.ceil((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));

  res.json({
    energy: user.energy,
    daysActive,
    treeHollowPosts,
    moodEntries,
    meditationSessions: meditationSessions.length,
    totalMeditationTime,
    memoryStories,
    memorials
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
