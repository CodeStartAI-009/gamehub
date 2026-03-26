import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useGameStore = create(
  persist(
    (set) => ({
      coins: 0,

      addCoins: (amount) =>
        set((state) => ({
          coins: state.coins + amount,
        })),

      spendCoins: (amount) =>
        set((state) => ({
          coins: Math.max(0, state.coins - amount),
        })),

      resetCoins: () => set({ coins: 0 }),
    }),
    {
      name: "game-storage", // storage key
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(
            name,
            JSON.stringify(value)
          );
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);