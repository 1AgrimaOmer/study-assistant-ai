import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Gemini AI Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('WARNING: GEMINI_API_KEY environment variable is not set. Please add it to your .env file.');
}

const ai = new GoogleGenAI({ apiKey });

// Validation helper for structured response
function validateStudyMaterial(data) {
  if (!data) return { valid: false, reason: 'Empty response data' };
  
  // 1. Check flashcards
  if (!Array.isArray(data.flashcards)) {
    return { valid: false, reason: 'Missing or invalid "flashcards" array' };
  }
  if (data.flashcards.length < 5 || data.flashcards.length > 8) {
    console.warn(`Warning: Flashcards count is ${data.flashcards.length}, expected 5-8.`);
  }
  for (const card of data.flashcards) {
    if (typeof card.question !== 'string' || !card.question.trim()) {
      return { valid: false, reason: 'Invalid or empty flashcard question' };
    }
    if (typeof card.answer !== 'string' || !card.answer.trim()) {
      return { valid: false, reason: 'Invalid or empty flashcard answer' };
    }
  }

  // 2. Check quiz
  if (!Array.isArray(data.quiz)) {
    return { valid: false, reason: 'Missing or invalid "quiz" array' };
  }
  if (data.quiz.length !== 5) {
    console.warn(`Warning: Quiz questions count is ${data.quiz.length}, expected 5.`);
  }
  for (const q of data.quiz) {
    if (typeof q.question !== 'string' || !q.question.trim()) {
      return { valid: false, reason: 'Invalid or empty quiz question' };
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      return { valid: false, reason: 'Quiz question options must have exactly 4 items' };
    }
    for (const opt of q.options) {
      if (typeof opt !== 'string' || !opt.trim()) {
        return { valid: false, reason: 'Empty or invalid quiz option' };
      }
    }
    if (typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3) {
      return { valid: false, reason: 'Quiz correct index must be an integer between 0 and 3' };
    }
  }

  return { valid: true };
}

app.post('/generate', async (req, res) => {
  const { input } = req.body;

  if (!input || typeof input !== 'string' || !input.trim()) {
    return res.status(400).json({ error: 'Input text is required' });
  }

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Backend Configuration Error: GEMINI_API_KEY is not configured on the server.' 
    });
  }

  try {
    const prompt = `Generate study material from the following input.

Return ONLY valid JSON in this format:
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
- No explanation or extra text.
- Always return 5-8 flashcards.
- Always return 5 quiz questions.
- Each quiz must have exactly 4 options.
- 'correct' must be the index (0-3).
- Ensure JSON is valid and parsable.

User input:
${input}`;

    // Define response schema to enforce structure programmatically
    const schema = {
      type: 'OBJECT',
      properties: {
        flashcards: {
          type: 'ARRAY',
          description: 'A list of 5 to 8 study flashcards containing questions and answers.',
          items: {
            type: 'OBJECT',
            properties: {
              question: { type: 'STRING' },
              answer: { type: 'STRING' }
            },
            required: ['question', 'answer']
          }
        },
        quiz: {
          type: 'ARRAY',
          description: 'A list of exactly 5 multiple choice questions.',
          items: {
            type: 'OBJECT',
            properties: {
              question: { type: 'STRING' },
              options: {
                type: 'ARRAY',
                items: { type: 'STRING' }
              },
              correct: { type: 'INTEGER' }
            },
            required: ['question', 'options', 'correct']
          }
        }
      },
      required: ['flashcards', 'quiz']
    };

    // Use Gemini model (gemini-2.0-flash is standard, fast, and supports structured JSON response)
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: schema,
        temperature: 0.2, // Lower temperature leads to more deterministic JSON output
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Received empty response from the AI model.');
    }

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse AI JSON response. Content was:', responseText);
      return res.status(502).json({ 
        error: 'The AI generated an invalid JSON structure. Please try again.',
        details: e.message 
      });
    }

    const validation = validateStudyMaterial(parsedData);
    if (!validation.valid) {
      console.error('AI response validation failed:', validation.reason, parsedData);
      return res.status(502).json({ 
        error: `The AI response failed validation: ${validation.reason}.`,
        data: parsedData 
      });
    }

    res.json(parsedData);
  } catch (error) {
    console.error('Error generating study material:', error);
    res.status(500).json({ 
      error: `AI Generation Error: ${error.message || 'An error occurred while generating study materials. Please try again.'}`,
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Study Assistant backend running on port ${PORT}`);
});
