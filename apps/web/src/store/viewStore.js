import { create } from "zustand";

const useViewStore = create((set) => ({
  activeView: "Lista",
  setActiveView: (view) => set({ activeView: view }),
}));

export default useViewStore;
