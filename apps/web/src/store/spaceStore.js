import { create } from "zustand";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const useSpaceStore = create((set, get) => ({
  spaces: [],
  currentSpace: null,
  loading: false,
  error: "",
  loadSpaces: async () => {
    set({ loading: true, error: "" });
    try {
      const res = await fetch(`${API_BASE}/api/spaces`);
      if (!res.ok) throw new Error("Falha ao carregar espacos");
      const data = await res.json();
      set({
        spaces: data,
        currentSpace: data[0] || null,
      });
    } catch (err) {
      set({ error: err.message || "Erro ao carregar espacos" });
    } finally {
      set({ loading: false });
    }
  },
  addSpace: async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set({ error: "" });
    try {
      const res = await fetch(`${API_BASE}/api/spaces`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error("Falha ao criar espaco");
      const created = await res.json();
      const { spaces } = get();
      set({
        spaces: [created, ...spaces],
        currentSpace: created,
      });
    } catch (err) {
      set({ error: err.message || "Erro ao criar espaco" });
    }
  },
  selectSpace: (space) => set({ currentSpace: space }),
}));

export default useSpaceStore;
