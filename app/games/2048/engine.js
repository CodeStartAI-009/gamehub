// app/games/2048/engine.js

//
// 🎯 CREATE GAME STATE
//
export function createGame() {
    return {
      board: createBoard(),
      score: 0,
      history: [],
      powerUps: {
        undo: 2,
        blast: 2,
        shuffle: 1,
      },
    };
  }
  
  //
  // 🎯 CREATE BOARD
  //
  export function createBoard() {
    let board = Array(16).fill(0);
    board = addRandom(board);
    board = addRandom(board);
    return board;
  }
  
  //
  // 🎲 ADD RANDOM TILE
  //
  export function addRandom(board) {
    const empty = board
      .map((v, i) => (v === 0 ? i : null))
      .filter((v) => v !== null);
  
    if (!empty.length) return board;
  
    const idx = empty[Math.floor(Math.random() * empty.length)];
  
    const newBoard = [...board];
    newBoard[idx] = Math.random() < 0.9 ? 2 : 4;
  
    return newBoard;
  }
  
  //
  // 🎮 MOVE
  //
  export function move(game, dir) {
    if (!["left", "right", "up", "down"].includes(dir)) return game;
  
    let { board, score, history } = game;
  
    let grid = toGrid(board);
    let gainedScore = 0;
  
    // normalize to LEFT
    if (dir === "right") grid = grid.map(reverse);
    if (dir === "up") grid = transpose(grid);
    if (dir === "down") grid = transpose(grid).map(reverse);
  
    // process rows
    const newGrid = grid.map((row) => {
      const { row: newRow, score: gained } = mergeRow(row);
      gainedScore += gained;
      return newRow;
    });
  
    // revert transform
    let finalGrid = newGrid;
  
    if (dir === "right") finalGrid = newGrid.map(reverse);
    if (dir === "up") finalGrid = transpose(newGrid);
    if (dir === "down") finalGrid = transpose(newGrid.map(reverse));
  
    let newBoard = flatten(finalGrid);
  
    if (arraysEqual(board, newBoard)) return game;
  
    // save history
    const newHistory = [
      ...history,
      {
        board: [...board],
        score,
      },
    ];
  
    newBoard = addRandom(newBoard);
  
    return {
      ...game,
      board: newBoard,
      score: score + gainedScore,
      history: newHistory,
    };
  }
  
  //
  // 🔥 MERGE LOGIC
  //
  function mergeRow(row) {
    let arr = row.filter((v) => v !== 0);
    let score = 0;
  
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        score += arr[i];
        arr[i + 1] = 0;
        i++; // critical
      }
    }
  
    arr = arr.filter((v) => v !== 0);
  
    while (arr.length < 4) arr.push(0);
  
    return { row: arr, score };
  }
  
  //
  // ↩️ UNDO
  //
  export function undo(game) {
    if (!game.history.length) return game;
    if (game.powerUps.undo <= 0) return game;
  
    const last = game.history[game.history.length - 1];
  
    return {
      ...game,
      board: [...last.board],
      score: last.score,
      history: game.history.slice(0, -1),
      powerUps: {
        ...game.powerUps,
        undo: game.powerUps.undo - 1,
      },
    };
  }
  
  //
  // 💥 BLAST
  //
  export function blast(game, index) {
    if (game.powerUps.blast <= 0) return game;
    if (game.board[index] === 0) return game;
  
    const newBoard = [...game.board];
    newBoard[index] = 0;
  
    return {
      ...game,
      board: newBoard,
      powerUps: {
        ...game.powerUps,
        blast: game.powerUps.blast - 1,
      },
    };
  }
  
  //
  // 🔀 SHUFFLE
  //
  export function shuffle(game) {
    if (game.powerUps.shuffle <= 0) return game;
  
    const newBoard = [...game.board].sort(() => Math.random() - 0.5);
  
    return {
      ...game,
      board: newBoard,
      powerUps: {
        ...game.powerUps,
        shuffle: game.powerUps.shuffle - 1,
      },
    };
  }
  
  //
  // 🛑 GAME OVER
  //
  export function isGameOver(board) {
    if (board.includes(0)) return false;
  
    for (let i = 0; i < 16; i++) {
      if (i % 4 !== 3 && board[i] === board[i + 1]) return false;
      if (i < 12 && board[i] === board[i + 4]) return false;
    }
  
    return true;
  }
  
  //
  // 🔄 HELPERS
  //
  function reverse(row) {
    return [...row].reverse();
  }
  
  function toGrid(arr) {
    return [
      arr.slice(0, 4),
      arr.slice(4, 8),
      arr.slice(8, 12),
      arr.slice(12, 16),
    ];
  }
  
  function flatten(grid) {
    return grid.flat();
  }
  
  function transpose(grid) {
    return grid[0].map((_, i) => grid.map((row) => row[i]));
  }
  
  function arraysEqual(a, b) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }