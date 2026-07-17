import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import Groq from 'groq-sdk';

dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ✅ Rate Limiter
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});
app.use('/generate', limiter);

// ✅ Groq Setup
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

if (!process.env.GROQ_API_KEY) {
  console.warn('⚠️ GROQ_API_KEY missing in .env');
}

/* ---------------- VALIDATION ---------------- */

function validateStudyMaterial(data) {
  if (!data) return { valid: false, reason: 'Empty response' };

  if (!Array.isArray(data.flashcards)) {
    return { valid: false, reason: 'Invalid flashcards' };
  }

  if (!Array.isArray(data.quiz)) {
    return { valid: false, reason: 'Invalid quiz' };
  }

  return { valid: true };
}

/* ---------------- JSON CLEANER ---------------- */

function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}

/* ---------------- ROUTE ---------------- */

app.post('/generate', async (req, res) => {
  const { input } = req.body;

  if (!input || typeof input !== 'string') {
    return res.status(400).json({ error: 'Input required' });
  }

  const trimmedInput = input.slice(0, 2000);

  const prompt = `
Generate study material.

Return ONLY JSON:
{
  "flashcards": [{ "question": "", "answer": "" }],
  "quiz": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correct": 0
    }
  ]
}

Rules:
- 5-8 flashcards
- 5 quiz questions
- No extra text

Input:
${trimmedInput}
`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant', 
      messages: [
        {
          role: 'system',
          content: 'Return ONLY valid JSON. No explanation.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    const rawText = response.choices[0].message.content;

    if (!rawText) throw new Error('Empty response');

    // ✅ Extract JSON safely
    const cleaned = extractJSON(rawText);

    let data;
    try {
      data = JSON.parse(cleaned);
    } catch (e) {
      console.error('❌ JSON Parse Error:', cleaned);
      return res.status(502).json({
        error: 'Invalid JSON from AI',
      });
    }

    const validation = validateStudyMaterial(data);

    if (!validation.valid) {
      return res.status(502).json({
        error: validation.reason,
      });
    }

    res.json(data);

  } catch (error) {
    console.error('🔥 ERROR:', error);

    res.status(500).json({
      error: 'Failed to generate study material',
    });
  }
});

/* ---------------- START ---------------- */

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});