import express from 'express';
import { reviewCode, analyzeProblemIntelligence } from '../utils/gemini.js';

const router = express.Router();

router.post('/review', async (req, res) => {
  const { code, context } = req.body;
  if (!code && !context) return res.status(400).json({ error: "Input is required" });

  try {
    const review = await reviewCode(code, context || "");
    res.json({ review });
  } catch (error) {
    console.error("AI Review Route Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/analyze-problem', async (req, res) => {
  const { title, userCode } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    // analyzeProblemIntelligence NEVER throws — it always returns either real or fallback data
    const report = await analyzeProblemIntelligence(title, userCode || null);
    res.json(report);
  } catch (error) {
    // This catch should now never be reached — but as a final safety net:
    console.error("CRITICAL AI Route Error:", error.message);
    res.status(500).json({ error: "AI pipeline critically failed: " + error.message });
  }
});

export default router;
