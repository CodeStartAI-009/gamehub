// app/games/2048/utils.js

export function scoreToCoins(score) {
    return Math.floor(score / 100); // 1000 → 10 coins
  }