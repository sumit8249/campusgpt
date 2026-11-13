import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { BookOpen, ShieldCheck, FileSearch, Sparkles, ArrowRight } from "lucide-react";
import useAuthStore from "../store/authStore";

export default function HomePage() {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();

  useEffect(() => {
    if (hydrated && user) {
      router.replace("/chat");
    }
  }, [hydrated, user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 flex flex-col">
      <header className="max-w-6xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-900">Campus GPT</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-700 hover:text-indigo-600 px-4 py-2"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-sm transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 text-center flex flex-col items-center justify-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Retrieval-Augmented Generation (RAG) for Campuses
        </span>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
          Instant, Verified Answers From Official College Documents
        </h1>

        <p className="text-slate-600 text-lg max-w-2xl mt-5 leading-relaxed">
          Ask questions about admissions, semester exam rules, hostel fees, scholarships, and
          placements. Every response is grounded in uploaded college circulars with exact source
          citations.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-md transition"
          >
            Launch Student Assistant <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold px-6 py-3.5 rounded-xl transition"
          >
            Admin Knowledge Portal
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mt-16 text-left w-full">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <FileSearch className="w-7 h-7 text-indigo-600 mb-3" />
            <h3 className="font-bold text-slate-900">Semantic Vector Retrieval</h3>
            <p className="text-sm text-slate-600 mt-1.5">
              PDFs and notices are parsed, chunked, and embedded for high-accuracy cosine similarity
              search.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <ShieldCheck className="w-7 h-7 text-emerald-600 mb-3" />
            <h3 className="font-bold text-slate-900">Zero-Hallucination Guardrails</h3>
            <p className="text-sm text-slate-600 mt-1.5">
              Includes source document badges, confidence scores, and explicit refusal when policies
              aren&apos;t uploaded.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <BookOpen className="w-7 h-7 text-amber-600 mb-3" />
            <h3 className="font-bold text-slate-900">Department Knowledge Bases</h3>
            <p className="text-sm text-slate-600 mt-1.5">
              Filter queries across Admissions, Academics, Exams, Hostel, Library, and Placements.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
