import { useState, useEffect } from "react";
import { Upload, FileText, Trash2, CheckCircle2, AlertCircle, Layers } from "lucide-react";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../services/api";

const DEPARTMENTS = ["General", "Admissions", "Academics", "Exams", "Hostel", "Placements", "Library"];

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("General");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchDocuments = async () => {
    try {
      const { data } = await api.get("/api/documents");
      setDocuments(data.documents || []);
    } catch {
      // Ignore error
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setStatusMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title || file.name);
      formData.append("department", department);

      const { data } = await api.post("/api/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatusMsg({ type: "success", text: data.message });
      setTitle("");
      setFile(null);
      e.target.reset();
      fetchDocuments();
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to process and index document.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this document and all its vector embeddings?")) return;
    await api.delete(`/api/documents/${id}`);
    fetchDocuments();
  };

  return (
    <ProtectedRoute adminOnly>
      <Layout>
        <div className="max-w-6xl w-full mx-auto p-6 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">College Knowledge Base</h1>
            <p className="text-sm text-slate-500 mt-1">
              Upload official PDF handbooks, fee structures, circulars, and FAQs. Files are
              automatically extracted, chunked, and embedded for RAG retrieval.
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" /> Upload New College Document
            </h2>

            {statusMsg && (
              <div
                className={`mb-4 p-3.5 rounded-xl text-sm flex items-center gap-2 ${
                  statusMsg.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border border-rose-200 text-rose-700"
                }`}
              >
                {statusMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="grid sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., B.Tech Academic Regulations 2026"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Category
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select File (.pdf, .txt, .md)
                </label>
                <input
                  type="file"
                  accept=".pdf,.txt,.md"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {uploading ? "Extracting & Generating Embeddings..." : "Index Document"}
                </button>
              </div>
            </form>
          </div>

          {/* Indexed Documents Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">
                Indexed Knowledge Base ({documents.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Document Title</th>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Vector Chunks</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        No college documents uploaded yet. Upload a PDF above to activate RAG.
                      </td>
                    </tr>
                  )}
                  {documents.map((doc) => (
                    <tr key={doc._id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{doc.title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                          {doc.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="inline-flex items-center gap-1 text-xs font-medium">
                          <Layers className="w-3.5 h-3.5 text-slate-400" /> {doc.chunkCount} chunks
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
