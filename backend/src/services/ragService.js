const { GoogleGenerativeAI } = require("@google/generative-ai");
const DocumentChunk = require("../models/DocumentChunk");

const apiKey = (process.env.GEMINI_API_KEY || "").trim();
const genAI =
  apiKey && apiKey !== "your_google_gemini_api_key_here"
    ? new GoogleGenerativeAI(apiKey)
    : null;

/**
 * Split extracted document text into clean, sentence-aligned chunks.
 */
function chunkText(text, chunkSize = 850, overlap = 120) {
  const cleaned = text.replace(/={3,}/g, " ").replace(/\s+/g, " ").trim();
  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];
  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if ((current + " " + trimmed).trim().length <= chunkSize) {
      current = (current + " " + trimmed).trim();
    } else {
      if (current.length > 35) chunks.push(current);
      const overlapText = current.slice(-overlap).replace(/^\S*\s/, "");
      current = (overlapText + " " + trimmed).trim();
    }
  }

  if (current.length > 35) chunks.push(current);
  return chunks;
}

/**
 * Deterministic bag-of-words hashing vector fallback (128 dims).
 */
function localFallbackEmbedding(text, dims = 128) {
  const vec = new Array(dims).fill(0);
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);

  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash * 31 + token.charCodeAt(i)) % dims;
    }
    vec[Math.abs(hash)] += 1;
  }

  const norm = Math.hypot(...vec) || 1;
  return vec.map((v) => v / norm);
}

/**
 * Generate dense vector embedding via Gemini gemini-embedding-001 (with local fallback).
 */
async function generateEmbedding(text) {
  if (!genAI) {
    return localFallbackEmbedding(text);
  }

  for (const modelName of ["gemini-embedding-001", "embedding-001"]) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.embedContent(text);
      if (result?.embedding?.values?.length) {
        return result.embedding.values;
      }
    } catch (err) {
      console.warn(`Embedding fallback (${modelName}):`, err.message);
    }
  }

  return localFallbackEmbedding(text);
}

/**
 * Compute cosine similarity between two equal-length vectors.
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

/**
 * Retrieve top-K most relevant chunks filtered optionally by department.
 */
async function retrieveRelevantChunks(query, departmentFilter = "All", topK = 4) {
  const filter =
    departmentFilter && departmentFilter !== "All" ? { department: departmentFilter } : {};

  const candidates = await DocumentChunk.find(filter).lean();
  if (candidates.length === 0) return [];

  const isLocalVectors = candidates[0].embedding?.length === 128;
  const queryEmbedding = isLocalVectors
    ? localFallbackEmbedding(query)
    : await generateEmbedding(query);

  return candidates
    .map((chunk) => ({
      ...chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
      isLocalVector: chunk.embedding?.length === 128,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Execute full RAG pipeline: Retrieve -> Relevance Guardrail -> Grounded LLM Generation.
 */
async function answerCollegeQuery(question, departmentFilter = "All", history = []) {
  const retrieved = await retrieveRelevantChunks(question, departmentFilter, 4);
  const topScore = retrieved.length > 0 ? retrieved[0].score : 0;
  const usingLocalVectors = retrieved.length > 0 && retrieved[0].isLocalVector;
  const threshold = usingLocalVectors ? 0.15 : 0.48;

  if (retrieved.length === 0 || topScore < threshold) {
    return {
      answer:
        "I could not find verified information about that in the uploaded college documents. Please contact the relevant campus office or ask an administrator to upload the official notice or handbook.",
      sources: [],
      confidenceScore: Math.round(Math.max(0, topScore) * 100),
      isUnknown: true,
    };
  }

  const contextBlock = retrieved
    .map((c, idx) => {
      const relevancePct = (c.score * 100).toFixed(1);
      return `[Source ${idx + 1}: ${c.documentTitle} | Department: ${c.department} | Relevance: ${relevancePct}%]\n${c.content}`;
    })
    .join("\n\n---\n\n");

  const recentHistory = history
    .slice(-4)
    .map((m) => `${m.role === "user" ? "Student" : "Campus GPT"}: ${m.content}`)
    .join("\n");

  const prompt = `You are Campus GPT, the official AI information assistant for Birla Global University (BGU), Bhubaneswar.
Answer the student's question using ONLY the verified College Context provided below.
Strict Rules:
1. Never invent dates, fees, eligibility rules, or policies not explicitly stated in the context.
2. Naturally cite the source document title(s) in your response.
3. If the context does not contain the exact detail asked (such as tuition or semester fees), explicitly state that it is not specified in the uploaded documents and only share related verified details if helpful.
4. Use clean bullet points for multi-part details.

Recent Conversation:
${recentHistory || "None"}

Verified College Context:
${contextBlock}

Student Question: ${question}`;

  let answerText = "";
  if (genAI) {
    for (const chatModel of ["gemini-3.8-flash", "gemini-3.5-flash-lite", "gemini-3.5-flash"]) {
      try {
        const model = genAI.getGenerativeModel({ model: chatModel });
        const result = await model.generateContent(prompt);
        answerText = result.response.text();
        if (answerText) break;
      } catch (err) {
        console.error(`Gemini generation error (${chatModel}):`, err.message);
      }
    }
  }

  if (!answerText) {
    answerText = `According to **${retrieved[0].documentTitle}** (${retrieved[0].department}):\n\n${retrieved[0].content}`;
  }

  return {
    answer: answerText,
    sources: retrieved.map((r) => ({
      documentTitle: r.documentTitle,
      department: r.department,
      excerpt: r.content.slice(0, 190) + (r.content.length > 190 ? "..." : ""),
      score: Math.round(r.score * 100),
    })),
    confidenceScore: Math.round(topScore * 100),
    isUnknown: false,
  };
}

module.exports = {
  chunkText,
  generateEmbedding,
  retrieveRelevantChunks,
  answerCollegeQuery,
};