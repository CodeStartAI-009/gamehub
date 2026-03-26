// 🎯 CREATE GAME
export function createGame(puzzle, solution, difficulty) {
    return {
      puzzle,
      solution,
      board: [...puzzle],
  
      notes: {},
      history: [],
  
      selectedCell: null,
      difficulty,
  
      mistakes: 0,
      startTime: Date.now(),
      status: "playing",
    };
  }
  
  //
  // ✍️ SET NUMBER
  //
  export function setNumber(game, index, value) {
    if (game.puzzle[index] !== 0) return game;
  
    const newBoard = [...game.board];
    newBoard[index] = value;
  
    const newHistory = [
      ...game.history,
      { board: [...game.board], notes: { ...game.notes } },
    ];
  
    let status = game.status;
  
    // ✅ CHECK WIN
    if (newBoard.every((v, i) => v === game.solution[i])) {
      status = "win";
    }
  
    return {
      ...game,
      board: newBoard,
      history: newHistory,
      status,
    };
  }
  
  //
  // ✏️ NOTES MODE
  //
  export function toggleNote(game, index, value) {
    const notes = { ...game.notes };
  
    const current = notes[index] || [];
  
    if (current.includes(value)) {
      notes[index] = current.filter((v) => v !== value);
    } else {
      notes[index] = [...current, value];
    }
  
    return {
      ...game,
      notes,
    };
  }
  
  //
  // 🔁 UNDO
  //
  export function undo(game) {
    if (!game.history.length) return game;
  
    const last = game.history[game.history.length - 1];
  
    return {
      ...game,
      board: last.board,
      notes: last.notes,
      history: game.history.slice(0, -1),
    };
  }
  
  //
  // 💡 HINT
  //
  export function useHint(game) {
    const empty = game.board
      .map((v, i) => (v === 0 ? i : null))
      .filter((v) => v !== null);
  
    if (!empty.length) return game;
  
    const idx = empty[Math.floor(Math.random() * empty.length)];
  
    const newBoard = [...game.board];
    newBoard[idx] = game.solution[idx];
  
    return {
      ...game,
      board: newBoard,
    };
  }