# Spec Driven Development (SDD) Specification — Campus GPT

## 1. Project Overview
Build **Campus GPT**, a full-stack Retrieval-Augmented Generation (RAG) college information assistant that lets administrators upload official college PDFs/documents and allows students to ask natural-language questions answered strictly from the indexed knowledge base with source citations and confidence scores.

## 2. Locked Tech Stack
- **Frontend:** Next.js (Pages Router), React, Tailwind CSS, Zustand, Axios, `lucide-react`
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, `bcryptjs`, `multer`, `pdf-parse`, `helmet`, `cors`, `express-validator`
- **AI Layer:** Google Gemini (`text-embedding-004` for embeddings, `gemini-2.5-flash` for grounded answers) with deterministic local fallback

## 3. Database Collections
- **Users:** `name`, `email`, `password` (`select: false`), `role` (`student` | `admin`), `department`, `createdAt`
- **Documents:** `title`, `fileName`, `department`, `uploadedBy`, `chunkCount`, `status` (`processing` | `indexed` | `failed`), `createdAt`
- **DocumentChunks:** `documentId`, `documentTitle`, `department`, `chunkIndex`, `content`, `embedding` (`[Number]`), `createdAt`
- **Conversations:** `userId`, `title`, `departmentFilter`, `updatedAt`
- **Messages:** `conversationId`, `role` (`user` | `assistant`), `content`, `sources`, `confidenceScore`, `isUnknown`, `feedback` (`up` | `down` | `null`), `createdAt`

## 4. API Contract
- `GET /api/health` — System health check
- `POST /api/auth/register` — Register student or admin
- `POST /api/auth/login` — Authenticate and return JWT
- `GET /api/auth/me` — Fetch logged-in user
- `POST /api/chat/ask` — Run RAG pipeline and store messages
- `GET /api/chat/conversations` — List user conversations
- `GET /api/chat/conversations/:id` — Get messages in a conversation
- `DELETE /api/chat/conversations/:id` — Delete a conversation
- `POST /api/chat/messages/:id/feedback` — Rate assistant response (`up` | `down`)
- `GET /api/documents` — List uploaded documents
- `POST /api/documents/upload` — Admin upload & vector index document
- `DELETE /api/documents/:id` — Admin delete document & chunks
- `GET /api/admin/analytics` — Admin usage & RAG quality metrics
