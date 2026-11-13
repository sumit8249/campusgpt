import { create } from "zustand";
import api from "../services/api";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  hydrated: false,

  hydrate: async () => {
    if (typeof window === "undefined") return;
    const savedToken = localStorage.getItem("campus_gpt_token");
    const savedUser = localStorage.getItem("campus_gpt_user");

    if (!savedToken) {
      set({ user: null, token: null, hydrated: true });
      return;
    }

    if (savedUser) {
      try {
        set({ user: JSON.parse(savedUser), token: savedToken, hydrated: true });
      } catch {
        set({ hydrated: true });
      }
    }

    try {
      const { data } = await api.get("/api/auth/me");
      localStorage.setItem("campus_gpt_user", JSON.stringify(data.user));
      set({ user: data.user, token: savedToken, hydrated: true });
    } catch {
      localStorage.removeItem("campus_gpt_token");
      localStorage.removeItem("campus_gpt_user");
      set({ user: null, token: null, hydrated: true });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    localStorage.setItem("campus_gpt_token", data.token);
    localStorage.setItem("campus_gpt_user", JSON.stringify(data.user));
    set({ user: data.user, token: data.token, hydrated: true });
    return data.user;
  },

  register: async (payload) => {
    const { data } = await api.post("/api/auth/register", payload);
    localStorage.setItem("campus_gpt_token", data.token);
    localStorage.setItem("campus_gpt_user", JSON.stringify(data.user));
    set({ user: data.user, token: data.token, hydrated: true });
    return data.user;
  },

  logout: () => {
    localStorage.removeItem("campus_gpt_token");
    localStorage.removeItem("campus_gpt_user");
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
