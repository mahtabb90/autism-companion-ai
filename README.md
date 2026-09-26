# 🧸 Autism Companion AI

Autism Companion AI is a calm, supportive full-stack web application designed to help children with autism, ADHD, and other children who benefit from predictable visual guidance.

The app supports children, parents, and caregivers through emotional check-ins, personalized AI-generated social stories, saved story reading, text-to-speech support, and a sensory-friendly interface.

> **Educational Disclaimer**  
> This application is an educational and supportive tool. It is not a diagnostic, clinical, therapeutic, or medical product, and it is not intended to replace professional healthcare, psychological, or educational guidance.

---

## 🌐 Live Demo

https://autism-companion-ai.vercel.app/

---

## ✨ Key Features

### ☀️ Child Mode

- **Emotion Check-In**  
  Children can choose how they feel using large, simple, visual emotion cards such as Happy, Calm, Excited, Tired, Worried, and Overwhelmed.

- **Calm Story Reader**  
  Social stories are shown as short, predictable pages to reduce cognitive load and support step-by-step understanding.

- **Text-to-Speech Support**  
  Built-in browser speech playback using the Web Speech API with a slower, calmer reading pace.

- **Adjustable Text Size**  
  Children can make the story text larger or smaller for easier reading.

- **Supportive Completion Screen**  
  A gentle success screen encourages the child after finishing a story.

---

### 🧸 Parent Mode

- **Parent Dashboard**  
  Parents and caregivers can view saved stories and child emotion logs.

- **Emotion Log Timeline**  
  Emotional check-ins are saved and displayed in a simple chronological format.

- **AI Social Story Generator**  
  Parents can generate personalized social stories based on everyday situations.

- **Custom Story Titles**  
  Parents can choose their own title for each story.

- **Personalized Inputs**  
  Story generation can include:
  - child name
  - age
  - situation
  - triggers
  - interests
  - calming tools
  - special details

- **Saved Stories**  
  Generated stories can be saved and opened later in Child Mode.

---

## 🤖 AI Social Story Generation

The app uses Google Gemini AI to generate calm, child-friendly social stories.

The story generation flow is designed to create stories that are:

- written in simple first-person language
- calm and predictable
- personalized to the child
- supportive without making medical claims
- focused on gentle coping options rather than commands
- structured into short, clear pages

If a Gemini API key is not available, the app uses a safe fallback story generator so the core experience still works.

Example situations include:

- getting a haircut
- going to the dentist
- riding the school bus
- starting preschool
- dealing with loud sounds
- waiting for a turn
- sharing toys
- handling transitions and new routines

---

## 🧠 Product Vision

Autism Companion AI is being developed as a real product concept for families, caregivers, and preschool environments.

The long-term vision is to support children with:

- social understanding
- emotional awareness
- daily routines
- communication support
- calm-down strategies
- predictable transitions
- visual learning

The primary focus is autism and ADHD support, but the app is also useful for neurotypical children who benefit from clear routines, visual structure, and gentle emotional support.

---

## 🎨 Design Philosophy

The interface is designed to be calm, predictable, and sensory-friendly.

Design principles:

- soft pastel colors
- large tap targets
- minimal visual noise
- clear navigation
- short text blocks
- predictable page structure
- gentle interactions
- no overwhelming animations

The app uses a warm companion character, Lumi the bear, to create a friendly and safe experience for children.

---

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Web Speech API
- Responsive UI design

### Backend

- FastAPI
- Python
- SQLite
- SQLAlchemy ORM
- Pydantic
- Google Gemini AI integration

### Testing

- Pytest
- FastAPI TestClient
- Frontend production build validation

### Deployment

- Frontend deployed on Vercel
- Backend deployed on Render

---

## 📁 Project Structure

```text
autism-companion-ai/
├── backend/
│   ├── app/
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── crud.py
│   │   ├── main.py
│   │   ├── routers/
│   │   └── services/
│   │       └── ai_service.py
│   ├── requirements.txt
│   └── test_main.py
│
├── frontend/
│   ├── src/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## ⚙️ Installation & Setup

You need:

- Python 3.10+
- Node.js 18+
- npm

---

## Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/Scripts/activate
pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload
```

The backend will run locally at:

```text
http://localhost:8000
```

---

## Gemini API Setup

The app can run with or without a Gemini API key.

To enable live AI story generation:

```bash
cd backend
cp .env.example .env
```

Then add your API key to `.env`:

```env
GEMINI_API_KEY=your_api_key_here
```

If no API key is provided, the app uses a structured fallback story generator.

---

## Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run locally at:

```text
http://localhost:5173
```

---

## Frontend Environment Variable

For deployed frontend environments such as Vercel, set:

```env
VITE_API_URL=your_render_backend_url
```

Example:

```env
VITE_API_URL=https://your-backend-service.onrender.com
```

---

## ✅ Testing

Run backend tests:

```bash
cd backend
source .venv/Scripts/activate
pytest
```

Build frontend:

```bash
cd frontend
npm run build
```

Current verified status:

- Backend tests passing
- Frontend build passing
- Frontend deployed on Vercel
- Backend deployed on Render

---

## 🧩 Product Roadmap

Planned improvements:

- Child profile and trigger library
- Personalized story generation based on saved child profile
- Routine builder
- First → Then visual board
- Communication cards
- TAKK-inspired visual support cards
- Lumi’s Calm Corner
- Breathing exercises for children
- Kids yoga stories and calm movement cards
- Preschool / Teacher Mode
- Swedish language support
- Printable stories and routine cards
- Parent-teacher sharing flow
- Authentication and privacy-focused data handling

---

## 🔐 Privacy & Safety Notes

This project may involve child-related information such as names, routines, emotional states, triggers, and sensory preferences.

Future production versions should include:

- authentication
- secure database design
- clear consent flow
- delete/export options
- role-based access for parents and educators
- GDPR-aware handling of child-related data
- privacy-first design for child-related information

This prototype should not be used as a clinical or diagnostic tool.

---

## 👩‍💻 About the Developer

Built by Mahtab Nezam as a full-stack AI product project.

This project combines AI development, full-stack engineering, child-centered design, accessibility thinking, and real-world experience from working with children in preschool environments.

---

## 📌 Repository

GitHub: https://github.com/mahtabb90/autism-companion-ai