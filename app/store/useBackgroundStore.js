// store/useBackgroundStore.js

import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useBackgroundStore = create(
  persist(
    (set, get) => ({
      //
      // 🎨 DEFAULT BACKGROUND
      //
      selected: "wood",

      unlocked: {
        wood: true, // ✅ default free
      },

      adsProgress: {},

      //
      // 🔓 UNLOCK BACKGROUND
      //
      unlock: (id) =>
        set((s) => ({
          unlocked: {
            ...s.unlocked,
            [id]: true,
          },
        })),

      //
      // 🎯 SELECT BACKGROUND (SAFE)
      //
      select: (id) => {
        const { unlocked } = get();

        if (!unlocked[id]) return; // ❌ prevent selecting locked

        set({ selected: id });
      },

      //
      // 🎥 AD PROGRESS SYSTEM
      //
      addAdProgress: (id, needed) =>
        set((s) => {
          const current = s.adsProgress[id] || 0;
          const updated = current + 1;

          const done = updated >= needed;

          return {
            adsProgress: {
              ...s.adsProgress,
              [id]: updated,
            },

            unlocked: done
              ? {
                  ...s.unlocked,
                  [id]: true,
                }
              : s.unlocked,
          };
        }),

      //
      // 🔁 OPTIONAL RESET (useful for testing)
      //
      resetBackgrounds: () =>
        set({
          selected: "wood",
          unlocked: { wood: true },
          adsProgress: {},
        }),
    }),

    {
      name: "bg-store",

      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },

        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },

        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);