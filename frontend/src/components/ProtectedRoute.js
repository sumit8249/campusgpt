import { useEffect } from "react";
import { useRouter } from "next/router";
import useAuthStore from "../store/authStore";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
    } else if (adminOnly && user.role !== "admin") {
      router.replace("/chat");
    }
  }, [hydrated, user, adminOnly, router]);

  if (!hydrated || !user || (adminOnly && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Verifying campus session...
      </div>
    );
  }

  return children;
}
