import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin (using environment variables)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

const db = admin.firestore();

// ====================== API ROUTES ======================

// GET /api/lore - Fetch dynamic lore from Firebase
app.get('/api/lore', async (req, res) => {
  try {
    const loreRef = db.collection('lore').doc('main');
    const doc = await loreRef.get();
    if (!doc.exists) {
      return res.json({ miracle: "The Miracle has not yet been written in the database..." });
    }
    res.json(doc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/prayer - Submit a "prayer" (user message) to Firebase
app.post('/api/prayer', async (req, res) => {
  try {
    const { name, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ error: "Name and message required" });
    }

    await db.collection('prayers').add({
      name,
      message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: "pending" // for future moderation
    });

    res.json({ success: true, message: "Your prayer has been heard by The High Wills..." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: "🩸 The Penitent One is alive and connected to Firebase!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Blasphemous Backend running on http://localhost:${PORT}`);
});
