// store/useSnakeStore.js

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export const useSnakeStore = create((set) => ({
  level: 1,

  load: async () => {
    const lvl = await AsyncStorage.getItem("snake_level");
    if (lvl) set({ level: parseInt(lvl) });
  },

  nextLevel: async () => {
    set((s) => {
      const newLevel = s.level + 1;
      AsyncStorage.setItem("snake_level", String(newLevel));
      return { level: newLevel };
    });
  },

  skipLevel: async () => {
    set((s) => {
      const newLevel = s.level + 1;
      AsyncStorage.setItem("snake_level", String(newLevel));
      return { level: newLevel };
    });
  },
}));