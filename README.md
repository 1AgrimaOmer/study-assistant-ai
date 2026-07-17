# StudySphere AI - Interactive Study Assistant

A full-stack, visually rich Study Assistant application that parses Gemini AI outputs into interactive learning components. It provides a non-chatbot interface where users paste notes or topics to generate 3D flashcards and customizable quizzes.

---

## Features
- **3D Interactive Flashcards**: Study terms with smooth CSS flip animations and progress indicators. Supports arrow key navigation.
- **Dynamic Quizzes**: Step-by-step gamified quiz experience with instant selection response.
- **Detailed Quiz Review**: Filter results to see incorrect answers, review correct options alongside user choices, and restart or retry only wrong items.
- **Session Persistence**: Progress, inputs, active tabs, and generated study content are saved automatically in `localStorage`.
- **Race Condition Prevention**: Ignore stale, slow AI responses when users trigger multiple generations sequentially.
- **Robust Schema Enforcement**: Enforces a strict JSON Schema inside backend calls to Gemini, with additional verification before sending details to the client.

---

## Project Structure
```
flemm/
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputBox.jsx
│   │   │   ├── Flashcard.jsx
│   │   │   ├── FlashcardList.jsx
│   │   │   ├── Quiz.jsx
│   │   │   └── QuizResult.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Setup & Running Guide

### Prerequisites
- Node.js installed (v18+ recommended)
- A Gemini API Key (obtain from [Google AI Studio](https://aistudio.google.com/))

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your environment variables file. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Edit the `.env` file and replace `your_gemini_api_key_here` with your actual Google Gemini API Key:
   ```env
   PORT=5000
   GEMINI_API_KEY=AIzaSy...
   GEMINI_MODEL=gemini-2.0-flash
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will run on [http://localhost:5000](http://localhost:5000).*

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on [http://localhost:5173](http://localhost:5173).* Open this link in your browser to start studying.

---

## How AI is Used

The backend server exposes a `/generate` endpoint. It receives the user's input, formats a structured prompt, and uses the official `@google/genai` Node.js SDK to query Gemini.

### Strict Prompt & Schema Enforcement
To guarantee the AI output can be parsed directly into React components without crashes, the app combines two layers of enforcement:
1. **Instructional Prompt**: Instructs the model to return *only* valid JSON.
2. **SDK-level JSON Schema (`responseJsonSchema`)**: In the Gemini model configuration, we pass a JSON schema defining `flashcards` and `quiz` structures, including property types, required fields, and array structures. This forces the model to reply in structured JSON matching:
   ```json
   {
     "flashcards": [
       { "question": "string", "answer": "string" }
     ],
     "quiz": [
       {
         "question": "string",
         "options": ["string", "string", "string", "string"],
         "correct": 0
       }
     ]
   }
   ```
3. **Backend Validation**: Before returning data to the frontend, the server runs a verification pass on the parsed object. If fields are missing, if option lengths are incorrect, or if indices are out of range, it returns an HTTP `502 Bad Gateway` error, prompting the frontend to display a friendly retry state.

---

## Known Limitations
- **Model Inaccuracies**: Like all LLMs, Gemini might occasionally output slightly off-topic answers or inaccurate answers (hallucinations).
- **JSON Structure Quirks**: In rare situations, if the API experiences heavy load or a parsing quirk, the response might fail validation. The app handles this gracefully, displaying an error screen with a "Retry" button.
- **Rate Limiting**: Under the free Gemini tier, requests may occasionally hit rate limits. If this occurs, wait 1 minute and click "Retry Request".

---

## Development Time Spent
- **Research & Requirements Engineering**: 10 minutes
- **Backend Architecture & API Validation**: 15 minutes
- **Frontend Integration (Tailwind CSS v4 & Vite)**: 10 minutes
- **Component Development (3D Flashcards & Quiz wizards)**: 20 minutes
- **Verification, Styling Polish, and Optimization**: 5 minutes
- **Total Estimated Time**: **1 hour (60 minutes)**
