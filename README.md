# Campus GPT — RAG-Based College Information Assistant

## 1. Project Name
**Campus GPT** (Retrieval-Augmented Generation College Chatbot)

## 2. Problem Statement
Students frequently struggle to find accurate, up-to-date answers across scattered college PDFs, admission brochures, examination circulars, hostel rulebooks, and placement reports. General AI chatbots hallucinate policies because they lack access to institution-specific records. **Campus GPT** solves this by indexing official college documents into a semantic vector store and generating strictly grounded answers with verifiable source citations.

## 3. Features
### Core Features
- **JWT User Authentication:** Secure registration, login, logout, and role-based access (`student` and `admin`) with `bcryptjs` password hashing.
- **Admin Document Management:** Upload PDF, TXT, or Markdown college documents, categorize by department, inspect chunk counts, and delete outdated files.
- **Complete RAG Pipeline:** `Document Upload -> Text Extraction (pdf-parse) -> Overlapping Chunking -> Vector Embeddings -> Cosine Similarity Search -> Grounded LLM Generation`.
- **Source & Reference Display:** Every answer displays cited document titles, departments, text excerpts, and relevance scores.
- **Unknown Question Guardrail:** Explicitly informs the student when official documents do not contain an answer instead of hallucinating.
- **Persistent Chat History:** Multi-turn conversation threads saved per user in MongoDB.

### Bonus Features Implemented
- **Department-Wise Knowledge Bases:** Filter queries across All Departments, Admissions, Academics, Exams, Hostel, Placements, or Library.
- **Confidence / Relevance Score Badges:** Displays top retrieval similarity percentage per response.
- **Suggested Starter Questions:** One-click campus prompts for faster onboarding.
- **Answer Feedback Loop:** Thumbs-up / thumbs-down rating on every AI response.
- **Admin Analytics Dashboard:** Real-time visibility into indexed documents, vector chunks, query volume, unresolved questions, and satisfaction rates.

## 4. Technology Stack
- **Frontend:** Next.js (Pages Router), React, Tailwind CSS, Zustand, Axios, Lucide Icons
- **Backend:** Node.js, Express.js, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `multer`, `pdf-parse`, `helmet`, `cors`, `express-validator`
- **AI & Embeddings:** Google Generative AI SDK (`gemini-2.5-flash` & `text-embedding-004`) with deterministic local vector fallback
- **Database:** MongoDB / MongoDB Atlas
- **Deployment:** GitHub, Render (Backend), Vercel (Frontend)

## 5. Screenshots
*(Add screenshots of your Student Chat Interface with Source Citations, Admin Document Upload Page, and Admin Analytics Dashboard here before final submission.)*

## 6. Live Demo
- **Frontend (Vercel):** `https://your-campus-gpt.vercel.app`

## 7. Backend
- **Backend API (Render):** `https://your-campus-gpt-api.onrender.com`

## 8. Setup Instructions
### Prerequisites
- Node.js v18+ installed
- MongoDB Atlas connection string (or local MongoDB running on `mongodb://127.0.0.1:27017/campus_gpt`)
- Google Gemini API Key from Google AI Studio

### Step 1: Configure & Start Backend
```bash
cd backend
cp .env.example .env
# Edit backend/.env with your MONGODB_URI, JWT_SECRET, and GEMINI_API_KEY
npm install
npm run dev
```

### Step 2: Configure & Start Frontend
```bash
cd frontend
cp .env.example .env.local
# Ensure NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

## 9. Environment Variables
### Backend (`backend/.env`)
- `PORT` — Server port (default `5000`)
- `MONGODB_URI` — MongoDB / MongoDB Atlas connection string
- `JWT_SECRET` — Secret key for signing JWT authentication tokens
- `GEMINI_API_KEY` — Google Gemini API key for embeddings and chat generation
- `ADMIN_INVITE_CODE` — Optional invite code required to register an `admin` account (default `CAMPUS_ADMIN_2026`)
- `FRONTEND_URL` — Allowed CORS origin URL (e.g., `http://localhost:3000` or your Vercel URL)

### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_API_URL` — Base URL of the Express backend API (e.g., `http://localhost:5000` or your Render URL)
