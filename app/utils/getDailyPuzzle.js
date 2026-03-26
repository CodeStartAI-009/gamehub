// utils/getDailyPuzzle.js

import { EASY } from "../games/sudoku/puzzles";

export function getDailyPuzzle() {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return EASY[day % EASY.length];
}