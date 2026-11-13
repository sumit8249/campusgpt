import { useState, useEffect, useRef } from "react";
import {
  Send,
  Plus,
  MessageSquare,
  Trash2,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import api from "../services/api";

const SUGGESTED_QUESTIONS = [
  "What are the B.Tech admission eligibility criteria and deadlines?",
  "How much is the annual hostel and mess fee?",
  "What is the minimum attendance required to appear in semester exams?",
  "What are the library borrowing rules and late fine policies?",
];

const DEPARTMENTS = ["All", "Admissions", "Academics", "Exams", "Hostel", "Placements", "Library"];

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [department, setDepartment] = useState("All");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const loadConversations = async () => {
    try {
      const { data } = await api.get("/api/chat/conversations");
      setConversations(data.conversations || []);
    } catch {
      // Ignore initial load error
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const selectConversation = async (id) => {
    setActiveConvId(id);
    try {
      const { data } = await api.get(`/api/chat/conversations/${id}`);
      setMessages(data.messages || []);
      if (data.conversation?.departmentFilter) {
        setDepartment(data.conversation.departmentFilter);
      }
    } catch {
      setMessages([]);
    }
  };

  const startNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    await api.delete(`/api/chat/conversations/${id}`);
    if (activeConvId === id) {
      startNewChat();
    }
    loadConversations();
  };

  const sendQuestion = async (customText) => {
    const q = (customText || input).trim();
    if (!q || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/api/chat/ask", {
        question: q,
        departmentFilter: department,
        conversationId: activeConvId,
      });

      setActiveConvId(data.conversationId);
      setMessages((prev) => [
        ...prev,
        {
          _id: data.messageId,
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
          confidenceScore: data.confidenceScore,
          isUnknown: data.isUnknown,
          feedback: null,
        },
      ]);
      loadConversations();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err.response?.data?.message ||
            "Unable to reach Campus GPT backend. Verify the server is running.",
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (messageId, rating) => {
    if (!messageId) return;
    await api.post(`/api/chat/messages/${messageId}/feedback`, { feedback: rating });
    setMessages((prev) =>
      prev.map((m) => (m._id === messageId ? { ...m, feedback: rating } : m))
    );
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="flex-1 flex max-w-7xl w-full mx-auto overflow-hidden">
          {/* Sidebar: Chat History */}
          <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col p-4">
            <button
              onClick={startNewChat}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 px-4 rounded-xl transition"
            >
              <Plus className="w-4 h-4" /> New Inquiry
            </button>

            <div className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400 px-2">
              Recent Conversations
            </div>

            <div className="mt-2 flex-1 overflow-y-auto space-y-1">
              {conversations.length === 0 && (
                <p className="text-xs text-slate-400 px-2 py-4">No chat history yet.</p>
              )}
              {conversations.map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => selectConversation(conv._id)}
                  className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition ${
                    activeConvId === conv._id
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className="w-4 h-4 shrink-0 text-slate-400" />
                    <span className="truncate">{conv.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv._id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1"
                    title="Delete chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </aside>

          {/* Main RAG Chat Area */}
          <div className="flex-1 flex flex-col bg-slate-50">
            {/* Department Filter Subheader */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={startNewChat}
                  className="lg:hidden inline-flex items-center gap-1 text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" /> New
                </button>
                <span className="text-xs font-medium text-slate-500">
                  Answers grounded in official college PDFs &amp; circulars
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Department Filter:</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {messages.length === 0 && (
                <div className="max-w-2xl mx-auto mt-6 bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
                  <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    What would you like to know about campus?
                  </h2>
                  <p className="text-sm text-slate-500 mt-1.5">
                    Select a sample question below or type your own query about courses, exams,
                    fees, hostel, or placements.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3 mt-6 text-left">
                    {SUGGESTED_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendQuestion(q)}
                        className="p-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 transition"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl px-5 py-4 shadow-sm ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-white border border-slate-200 text-slate-800"
                    }`}
                  >
                    {msg.isUnknown && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg mb-2.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Not Found in Knowledge Base
                      </div>
                    )}

                    <div className="whitespace-pre-line text-sm leading-relaxed">{msg.content}</div>

                    {/* Source Citations */}
                    {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-emerald-700 flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4" /> Verified Sources (
                            {msg.sources.length})
                          </span>
                          {typeof msg.confidenceScore === "number" && (
                            <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                              Relevance Score: {msg.confidenceScore}%
                            </span>
                          )}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-2">
                          {msg.sources.map((src, sIdx) => (
                            <div
                              key={sIdx}
                              className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-xs"
                            >
                              <div className="font-semibold text-slate-900 flex items-center justify-between gap-1">
                                <span className="truncate">{src.documentTitle}</span>
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded shrink-0">
                                  {src.department}
                                </span>
                              </div>
                              <p className="text-slate-500 mt-1 line-clamp-2">{src.excerpt}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Feedback Controls */}
                    {msg.role === "assistant" && msg._id && (
                      <div className="mt-3 pt-2 flex items-center gap-2 text-xs text-slate-400">
                        <span>Was this answer helpful?</span>
                        <button
                          onClick={() => handleFeedback(msg._id, "up")}
                          className={`p-1 rounded hover:bg-slate-100 transition ${
                            msg.feedback === "up" ? "text-emerald-600 bg-emerald-50" : ""
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg._id, "down")}
                          className={`p-1 rounded hover:bg-slate-100 transition ${
                            msg.feedback === "down" ? "text-rose-600 bg-rose-50" : ""
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 animate-pulse">
                  <span>Searching college vector database &amp; generating grounded answer...</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Bottom Prompt Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendQuestion();
              }}
              className="bg-white border-t border-slate-200 p-4"
            >
              <div className="max-w-3xl mx-auto flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about admissions, exams, hostel, library, or placements..."
                  className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-50 transition"
                >
                  <Send className="w-4 h-4" /> Ask
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
