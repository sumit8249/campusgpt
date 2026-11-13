import { useState, useEffect } from "react";
import { FileText, Layers, MessageSquare, ThumbsUp, AlertTriangle } from "lucide-react";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../services/api";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get("/api/admin/analytics")
      .then((res) => setData(res.data))
      .catch(() => {});
  }, []);

  const metrics = data?.metrics || {
    totalDocuments: 0,
    totalChunks: 0,
    totalQueries: 0,
    unknownQueries: 0,
    satisfactionRate: 100,
  };

  return (
    <ProtectedRoute adminOnly>
      <Layout>
        <div className="max-w-6xl w-full mx-auto p-6 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Campus GPT Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitor knowledge base coverage, student query volume, and RAG answer quality.
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <FileText className="w-5 h-5 text-indigo-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{metrics.totalDocuments}</div>
              <div className="text-xs text-slate-500 mt-0.5">Indexed Documents</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <Layers className="w-5 h-5 text-violet-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{metrics.totalChunks}</div>
              <div className="text-xs text-slate-500 mt-0.5">Vector Embeddings</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <MessageSquare className="w-5 h-5 text-sky-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{metrics.totalQueries}</div>
              <div className="text-xs text-slate-500 mt-0.5">Student Questions</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <ThumbsUp className="w-5 h-5 text-emerald-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{metrics.satisfactionRate}%</div>
              <div className="text-xs text-slate-500 mt-0.5">Positive Feedback</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{metrics.unknownQueries}</div>
              <div className="text-xs text-slate-500 mt-0.5">Unanswered Gaps</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Department Coverage */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-4">Department Knowledge Coverage</h2>
              {(!data?.deptBreakdown || data.deptBreakdown.length === 0) && (
                <p className="text-sm text-slate-400">No documents indexed yet.</p>
              )}
              <div className="space-y-3">
                {data?.deptBreakdown?.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <span className="font-semibold text-sm text-slate-800">{item._id}</span>
                    <span className="text-xs text-slate-600">
                      {item.documents} docs • {item.chunks} chunks
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Student Queries */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-4">Recent Student Queries</h2>
              {(!data?.recentQueries || data.recentQueries.length === 0) && (
                <p className="text-sm text-slate-400">No student questions recorded yet.</p>
              )}
              <div className="space-y-2.5">
                {data?.recentQueries?.map((q) => (
                  <div
                    key={q._id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700"
                  >
                    {q.content}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
