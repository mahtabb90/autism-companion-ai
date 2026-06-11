# Autism Companion AI 🧸☀️

Autism Companion AI is a supportive, educational web application designed for children with autism and their parents. The application translates complex or potentially stressful everyday situations (like dentist visits, haircuts, or sharing toys) into calm, predictable, step-by-step **Social Stories** following Carol Gray's therapeutic design rules.

This application is built from the ground up with a calm, high-accessibility interface tailored to avoid sensory overload.

---

> [!WARNING]
> **Educational Disclaimer**: This application is strictly an educational support tool. It is not clinical, therapeutic, or medical software, and is not intended to diagnose, treat, or replace professional healthcare guidance.

---

## 🚀 Key Features

### ☀️ Child Mode
- **Emotion Check-In Grid**: Visual, oversized emoji cards (Happy, Calm, Excited, Tired, Worried, Overwhelmed) styled with soothing pastel border tones. Logs entries directly to the database.
- **Accessible Carousel Story Reader**: Splits stories into discrete, single-sentence visual slides to reduce cognitive load.
- **Custom Text-to-Speech (TTS)**: Built-in voice playback using the browser's Web Speech API, set to a slow, predictable pacing (`0.85` rate) and warm pitch. Includes *Auto-Read* settings.
- **Aa Sizing Controls**: Dynamic text enlargement (`Aa-` / `Aa+`) to improve readability.
- **Success Completion Screen**: A celebratory screen thanking the child for reading.

### 🧸 Parent Dashboard
- **Child Emotional Tracker**: Chronological timeline displaying emotional logs reported by the child (including self-reported intensity levels and optional parent-logged notes).
- **Social Story Generator**: Select from predefined situation templates or compose a custom situation. Incorporates child details (name, age, triggers, interests) dynamically.
- **Carol Gray Rules Prompt**: AI service formats text into descriptive, perspective, and cooperative sentences, written in the 1st person perspective.
- **Printable Layouts**: Format social stories into clean, visual PDF/Print templates with scene illustration descriptions.

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS v4 (Custom calm theme color mapping)
- **Backend**: FastAPI, SQLite, SQLAlchemy ORM, Pydantic
- **Testing**: Pytest & FastAPI TestClient
- **Accessibility**: Web Speech API (`speechSynthesis`), responsive font-sizing guides

---

## 📁 Project Structure

```
autism-companion-ai/
├── backend/                  # FastAPI & SQLite Database
│   ├── app/
│   │   ├── database.py       # SQLAlchemy engine & session getter
│   │   ├── models.py         # DB Schemas (emotions, situations, stories)
│   │   ├── schemas.py        # Pydantic validation
│   │   ├── crud.py           # DB operations & deduplicated seed data
│   │   ├── main.py           # App routing entry & CORS config
│   │   ├── routers/          # API Route Controllers
│   │   └── services/
│   │       └── ai_service.py # Mock AI custom story creator
│   ├── requirements.txt      # Python backend packages
│   └── test_main.py          # Pytest backend validation tests
│
└── frontend/                 # React TS Frontend
    ├── postcss.config.js     # PostCSS styling configuration
    ├── tailwind.config.js    # Soft accessibility color palette tokens
    ├── index.html            # Google Fonts import & SEO tags
    └── src/
        ├── App.tsx           # Page routing shell & layout
        ├── hooks/
        │   └── useSpeechSynthesis.ts # TTS browser speech synthesis utility
        ├── services/
        │   └── api.ts        # API client fetch wrapper
        └── pages/
            ├── Home.tsx      # Welcome role selection
            ├── ChildMode.tsx # Emotion logger & story carousel reader
            └── ParentMode.tsx# Parent timeline dashboard & story builder
```

---

## ⚙️ Installation & Setup

You will need **Python 3.10+**, **Node.js 18+**, and **npm** installed on your system.

### 1. Backend API Setup
In your terminal, navigate to the `backend` folder:
```bash
cd backend
```

Create a Python virtual environment and activate it:
```bash
# On Git Bash / macOS / Linux:
python -m venv .venv
source .venv/Scripts/activate

# On Windows PowerShell:
# python -m venv .venv
# .\.venv\Scripts\Activate.ps1
```

Install backend dependencies:
```bash
pip install -r requirements.txt
```

Run uvicorn dev server:
```bash
./.venv/Scripts/python -m uvicorn app.main:app --reload
```
The server will boot on [http://localhost:8000](http://localhost:8000). The SQLite database `app.db` will automatically generate and seed with templates.

### 1.5. Configure Gemini API (Optional Fallback)
This application integrates with the **Gemini API** using the Google GenAI SDK to compose high-quality, customized social stories in real-time. If the API key is not configured, the application automatically falls back to structured preseeded and mock social stories.

To enable live AI generation:
1. Obtain a free Gemini API Key from Google AI Studio: [https://aistudio.google.com/](https://aistudio.google.com/)
2. In the `backend` folder, copy the `.env.example` template to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Open the newly created `.env` file and add your API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```
4. Start or restart the backend server. The application will detect the key and switch from mock generation to live AI generation.

### 2. Frontend Setup
In a new terminal window, navigate to the `frontend` folder:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Run Vite development server:
```bash
npm run dev
```
The application will launch on [http://localhost:5173](http://localhost:5173).

---

## 🧪 Running Automated Tests

To execute the backend test suite, run:
```bash
cd backend
./.venv/Scripts/pytest test_main.py
```

---

## 🎨 Design Philosophy (Calm & Accessible)

The visual design avoids sensory triggers:
- **Harmony Over Contrast**: Soft Slate Blues (`#F0F4F8`), soothing mints (`#EBF5F0`), and warm creams (`#FCFAF7`). Text is mid-level charcoal (`#2D3748`) to avoid screen glare.
- **Clear Typography**: Employs **Lexend** and **Outfit** rounded, geometric font faces specifically designed to ease reading difficulties and dyslexia.
- **Generous Tap Targets**: All buttons have extra padding, large icon elements, and clean animations to prevent accidental navigation.
