import Link from "next/link";
import { useRouter } from "next/router";
import { BookOpen, MessageSquare, FileText, BarChart3, LogOut, Shield } from "lucide-react";
import useAuthStore from "../store/authStore";

export default function Layout({ children }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navLinkClass = (path) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
      router.pathname === path
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/chat" className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-900">Campus GPT</span>
            </Link>

            {user && (
              <nav className="hidden md:flex items-center gap-1">
                <Link href="/chat" className={navLinkClass("/chat")}>
                  <MessageSquare className="w-4 h-4" /> Ask AI
                </Link>
                {user.role === "admin" && (
                  <>
                    <Link href="/admin/documents" className={navLinkClass("/admin/documents")}>
                      <FileText className="w-4 h-4" /> Knowledge Base
                    </Link>
                    <Link href="/admin/analytics" className={navLinkClass("/admin/analytics")}>
                      <BarChart3 className="w-4 h-4" /> Analytics
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-100 px-3 py-1.5 rounded-full">
                {user.role === "admin" && <Shield className="w-3.5 h-3.5 text-indigo-600" />}
                <span className="font-semibold text-slate-800">{user.name}</span>
                <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
