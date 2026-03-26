// app/games/xox/XOXAI.js

export function getBestMove(game, aiPlayer, difficulty = "easy") {
    if (difficulty === "easy") {
      return easyMove(game, aiPlayer);
    }
  
    if (difficulty === "medium") {
      return mediumMove(game, aiPlayer);
    }
  
    return hardMove(game, aiPlayer);
  }
  
  //
  // 🟢 EASY AI
  //
  function easyMove(game, aiPlayer) {
    const { board } = game;
    const empty = getEmpty(board);
  
    // 30% smart, 70% random
    if (Math.random() < 0.3) {
      return mediumMove(game, aiPlayer);
    }
  
    return randomPick(empty);
  }
  
  //
  // 🟡 MEDIUM AI
  //
  function mediumMove(game, aiPlayer) {
    const { board, size } = game;
    const opponent = getOpponent(aiPlayer);
  
    const empty = getEmpty(board);
  
    // 1. WIN
    for (let i of empty) {
      const temp = [...board];
      temp[i] = aiPlayer;
      if (checkWinner(temp, size) === aiPlayer) return i;
    }
  
    // 2. BLOCK
    for (let i of empty) {
      const temp = [...board];
      temp[i] = opponent;
      if (checkWinner(temp, size) === opponent) return i;
    }
  
    // 3. CENTER
    const centers = getCenters(size);
    for (let c of centers) {
      if (board[c] === null) return c;
    }
  
    // 4. CORNERS
    const corners = getCorners(size).filter((c) => board[c] === null);
    if (corners.length) return randomPick(corners);
  
    return randomPick(empty);
  }
  
  //
  // 🔴 HARD AI (MINIMAX - LIMITED DEPTH)
  //
  function hardMove(game, aiPlayer) {
    const { board, size } = game;
  
    let bestScore = -Infinity;
    let bestMove = null;
  
    const empty = getEmpty(board);
  
    for (let i of empty) {
      const temp = [...board];
      temp[i] = aiPlayer;
  
      const score = minimax(
        temp,
        size,
        0,
        false,
        aiPlayer,
        getOpponent(aiPlayer),
        -Infinity,
        Infinity
      );
  
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  
    return bestMove ?? randomPick(empty);
  }
  
  //
  // 🧠 MINIMAX (ALPHA-BETA PRUNING)
  //
  function minimax(board, size, depth, isMax, ai, opponent, alpha, beta) {
    const winner = checkWinner(board, size);
  
    if (winner === ai) return 10 - depth;
    if (winner === opponent) return depth - 10;
  
    if (board.every((c) => c !== null)) return 0;
  
    // LIMIT DEPTH (important for 5x5, 7x7)
    const maxDepth = size === 3 ? 9 : 4;
    if (depth >= maxDepth) return heuristic(board, size, ai);
  
    if (isMax) {
      let best = -Infinity;
  
      for (let i of getEmpty(board)) {
        const temp = [...board];
        temp[i] = ai;
  
        const val = minimax(
          temp,
          size,
          depth + 1,
          false,
          ai,
          opponent,
          alpha,
          beta
        );
  
        best = Math.max(best, val);
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
  
      return best;
    } else {
      let best = Infinity;
  
      for (let i of getEmpty(board)) {
        const temp = [...board];
        temp[i] = opponent;
  
        const val = minimax(
          temp,
          size,
          depth + 1,
          true,
          ai,
          opponent,
          alpha,
          beta
        );
  
        best = Math.min(best, val);
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
  
      return best;
    }
  }
  
  //
  // ⚖️ HEURISTIC (for big boards)
  //
  function heuristic(board, size, ai) {
    const opponent = getOpponent(ai);
  
    let score = 0;
  
    const lines = getAllLines(size);
  
    for (let line of lines) {
      let aiCount = 0;
      let oppCount = 0;
  
      for (let i of line) {
        if (board[i] === ai) aiCount++;
        if (board[i] === opponent) oppCount++;
      }
  
      if (aiCount > 0 && oppCount === 0) score += aiCount;
      if (oppCount > 0 && aiCount === 0) score -= oppCount;
    }
  
    return score;
  }
  
  //
  // 🔧 HELPERS
  //
  function getEmpty(board) {
    return board
      .map((v, i) => (v === null ? i : null))
      .filter((v) => v !== null);
  }
  
  function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  function getOpponent(p) {
    return p === "X" ? "O" : "X";
  }
  
  function getCenters(size) {
    if (size % 2 === 1) {
      const mid = Math.floor(size / 2);
      return [mid * size + mid];
    }
  
    const mid = size / 2;
    return [
      (mid - 1) * size + (mid - 1),
      (mid - 1) * size + mid,
      mid * size + (mid - 1),
      mid * size + mid,
    ];
  }
  
  function getCorners(size) {
    return [
      0,
      size - 1,
      size * (size - 1),
      size * size - 1,
    ];
  }
  
  function getAllLines(size) {
    const lines = [];
  
    // rows
    for (let r = 0; r < size; r++) {
      const row = [];
      for (let c = 0; c < size; c++) row.push(r * size + c);
      lines.push(row);
    }
  
    // cols
    for (let c = 0; c < size; c++) {
      const col = [];
      for (let r = 0; r < size; r++) col.push(r * size + c);
      lines.push(col);
    }
  
    // diagonals
    lines.push([...Array(size)].map((_, i) => i * size + i));
    lines.push([...Array(size)].map((_, i) => i * size + (size - i - 1)));
  
    return lines;
  }
  
  //
  // 🏁 WIN CHECK (same as engine)
  //
  function checkWinner(board, size) {
    const winLength = size <= 3 ? 3 : size <= 5 ? 4 : 5;
  
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];
  
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const start = board[r * size + c];
        if (!start) continue;
  
        for (let [dr, dc] of directions) {
          let count = 0;
  
          for (let k = 0; k < winLength; k++) {
            const nr = r + dr * k;
            const nc = c + dc * k;
  
            if (
              nr < 0 ||
              nc < 0 ||
              nr >= size ||
              nc >= size ||
              board[nr * size + nc] !== start
            ) {
              break;
            }
  
            count++;
          }
  
          if (count === winLength) return start;
        }
      }
    }
  
    return null;
  }