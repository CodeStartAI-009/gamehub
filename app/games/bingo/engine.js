// 🎯 CREATE BOARD (1–25 shuffled)
export function createBoard(size = 5) {
    const nums = Array.from({ length: size * size }, (_, i) => i + 1);
  
    return shuffle(nums);
  }
  
  function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }
  
  //
  // 🎯 CREATE GAME
  //
  export function createGame(size = 5) {
    return {
      size,
  
      playerBoard: createBoard(size),
      aiBoard: createBoard(size),
  
      playerMarked: Array(size * size).fill(false),
      aiMarked: Array(size * size).fill(false),
  
      calledNumbers: [],
  
      playerLines: 0,
      aiLines: 0,
  
      turn: "player", // or "ai"
      status: "playing",
    };
  }
  
  //
  // 🎯 MARK NUMBER
  //
  export function markNumber(board, marked, number) {
    const idx = board.indexOf(number);
    if (idx !== -1) marked[idx] = true;
  }
  
  //
  // 🎯 COUNT LINES
  //
  export function countLines(marked, size) {
    let lines = 0;
  
    // rows
    for (let r = 0; r < size; r++) {
      let ok = true;
      for (let c = 0; c < size; c++) {
        if (!marked[r * size + c]) ok = false;
      }
      if (ok) lines++;
    }
  
    // cols
    for (let c = 0; c < size; c++) {
      let ok = true;
      for (let r = 0; r < size; r++) {
        if (!marked[r * size + c]) ok = false;
      }
      if (ok) lines++;
    }
  
    // diagonals
    let d1 = true, d2 = true;
  
    for (let i = 0; i < size; i++) {
      if (!marked[i * size + i]) d1 = false;
      if (!marked[i * size + (size - i - 1)]) d2 = false;
    }
  
    if (d1) lines++;
    if (d2) lines++;
  
    return lines;
  }
  
  //
  // 🎯 APPLY MOVE
  //
  export function applyMove(game, number) {
    if (game.calledNumbers.includes(number)) return game;
  
    const playerMarked = [...game.playerMarked];
    const aiMarked = [...game.aiMarked];
  
    markNumber(game.playerBoard, playerMarked, number);
    markNumber(game.aiBoard, aiMarked, number);
  
    const playerLines = countLines(playerMarked, game.size);
    const aiLines = countLines(aiMarked, game.size);
  
    let status = "playing";
  
    if (playerLines >= 5) status = "player";
    if (aiLines >= 5) status = "ai";
  
    return {
      ...game,
      playerMarked,
      aiMarked,
      playerLines,
      aiLines,
      calledNumbers: [...game.calledNumbers, number],
      turn: game.turn === "player" ? "ai" : "player",
      status,
    };
  }