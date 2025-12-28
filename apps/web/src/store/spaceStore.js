import { create } from "zustand";

const DEFAULT_RECENTS = ["My Software Team", "Meu espaco de desc..."];

const useSpaceStore = create((set) => ({
  recents: DEFAULT_RECENTS,
  currentSpace: DEFAULT_RECENTS[0],
  addSpace: (name) =>
    set((state) => ({
      recents: [name, ...state.recents],
      currentSpace: name,
    })),
  selectSpace: (name) => set({ currentSpace: name }),
}));

export default useSpaceStore;
