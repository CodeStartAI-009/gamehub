// app/games/bingo/ai.js

import { countLines } from "./engine";

//
// 🎯 MAIN AI ENTRY
//
export function getAIMove(game, difficulty = "medium") {
  const available = getAvailableNumbers(game);

  if (available.length === 0) return null;

  switch (difficulty) {
    case "easy":
      return randomPick(available);

    case "medium":
      return (
        tryWin(game, available) ||
        randomPick(available)
      );

    case "hard":
      return (
        tryWin(game, available) ||
        tryBlock(game, available) ||
        smartPick(game, available)
      );

    case "expert":
      return (
        bestStrategicPick(game, available) ||
        tryWin(game, available) ||
        tryBlock(game, available) ||
        smartPick(game, available)
      );

    default:
      return randomPick(available);
  }
}

//
// 📦 AVAILABLE NUMBERS
//
function getAvailableNumbers(game) {
  const all = Array.from(
    { length: game.size * game.size },
    (_, i) => i + 1
  );

  return all.filter((n) => !game.calledNumbers.includes(n));
}

//
// 🎲 RANDOM
//
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

//
// 🏆 TRY WIN
//
function tryWin(game, available) {
  return findLineImprovement(
    game.aiBoard,
    game.aiMarked,
    available,
    game.size
  );
}

//
// 🛑 TRY BLOCK PLAYER
//
function tryBlock(game, available) {
  return findLineImprovement(
    game.playerBoard,
    game.playerMarked,
    available,
    game.size
  );
}

//
// 🧠 SMART PICK (MEDIUM FALLBACK)
//
function smartPick(game, available) {
  let best = null;
  let bestScore = -1;

  for (let num of available) {
    const score = simulateScore(
      game.aiBoard,
      game.aiMarked,
      num,
      game.size
    );

    if (score > bestScore) {
      bestScore = score;
      best = num;
    }
  }

  return best || randomPick(available);
}

//
// 🔥 EXPERT STRATEGY (MULTI-LINE OPTIMIZATION)
//
function bestStrategicPick(game, available) {
  let best = null;
  let bestValue = -Infinity;

  for (let num of available) {
    const aiGain = simulateScore(
      game.aiBoard,
      game.aiMarked,
      num,
      game.size
    );

    const playerGain = simulateScore(
      game.playerBoard,
      game.playerMarked,
      num,
      game.size
    );

    // prioritize: win + block combo
    const value = aiGain * 2 + playerGain;

    if (value > bestValue) {
      bestValue = value;
      best = num;
    }
  }

  return best;
}

//
// 🔍 FIND LINE IMPROVEMENT
//
function findLineImprovement(board, marked, available, size) {
  for (let num of available) {
    const idx = board.indexOf(num);
    if (idx === -1) continue;

    const temp = [...marked];
    temp[idx] = true;

    const before = countLines(marked, size);
    const after = countLines(temp, size);

    if (after > before) return num;
  }

  return null;
}

//
// 📊 SIMULATE SCORE
//
function simulateScore(board, marked, num, size) {
  const idx = board.indexOf(num);
  if (idx === -1) return 0;

  const temp = [...marked];
  temp[idx] = true;

  return countLines(temp, size) - countLines(marked, size);
}