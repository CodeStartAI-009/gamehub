// app/games/xox/XOXEngine.js

export function createGame(size = 3, players = ["X", "O"]) {
    return {
      size,
      board: Array(size * size).fill(null),
      blocked: Array(size * size).fill(false),
      history: [],
      currentPlayer: players[0],
      players,
      winner: null,
      isDraw: false,
  
      powerUps: {
        X: { undo: 1, block: 1, double: 1 },
        O: { undo: 1, block: 1, double: 1 },
      },
  
      doubleTurn: false,
    };
  }
  
  //
  // 🎯 MAKE MOVE
  //
  export function makeMove(game, index) {
    if (
      game.board[index] !== null ||
      game.blocked[index] ||
      game.winner ||
      game.isDraw
    ) {
      return game;
    }
  
    const newBoard = [...game.board];
    newBoard[index] = game.currentPlayer;
  
    // ✅ FIX: deep copy history
    const newHistory = [
      ...game.history,
      {
        board: [...game.board],
        blocked: [...game.blocked],
        player: game.currentPlayer,
      },
    ];
  
    const winner = checkWinner(newBoard, game.size);
    const isDraw = !winner && newBoard.every((c) => c !== null);
  
    let nextPlayer;
  
    if (game.doubleTurn) {
      nextPlayer = game.currentPlayer;
    } else {
      nextPlayer = getNextPlayer(game);
    }
  
    return {
      ...game,
      board: newBoard,
      history: newHistory,
      currentPlayer: winner || isDraw ? game.currentPlayer : nextPlayer,
      winner,
      isDraw,
      doubleTurn: false,
    };
  }
  
  //
  // 🔁 UNDO
  //
  export function undoMove(game) {
    const player = game.currentPlayer;
  
    if (game.powerUps[player].undo <= 0) return game;
    if (game.history.length === 0) return game;
  
    const last = game.history[game.history.length - 1];
  
    return {
      ...game,
      board: [...last.board],
      blocked: [...last.blocked],
      history: game.history.slice(0, -1),
      currentPlayer: last.player,
      winner: null,
      isDraw: false,
      doubleTurn: false,
  
      powerUps: {
        ...game.powerUps,
        [player]: {
          ...game.powerUps[player],
          undo: game.powerUps[player].undo - 1,
        },
      },
    };
  }
  
  //
  // 💣 BLOCK CELL
  //
  export function blockCell(game, index) {
    const player = game.currentPlayer;
  
    if (game.powerUps[player].block <= 0) return game;
    if (game.board[index] !== null) return game;
    if (game.blocked[index]) return game; // ✅ FIX
  
    const newBlocked = [...game.blocked];
    newBlocked[index] = true;
  
    return {
      ...game,
      blocked: newBlocked,
      powerUps: {
        ...game.powerUps,
        [player]: {
          ...game.powerUps[player],
          block: game.powerUps[player].block - 1,
        },
      },
    };
  }
  
  //
  // ⚡ DOUBLE MOVE
  //
  export function activateDoubleMove(game) {
    const player = game.currentPlayer;
  
    if (game.powerUps[player].double <= 0) return game;
    if (game.doubleTurn) return game; // ✅ prevent stacking
  
    return {
      ...game,
      doubleTurn: true,
      powerUps: {
        ...game.powerUps,
        [player]: {
          ...game.powerUps[player],
          double: game.powerUps[player].double - 1,
        },
      },
    };
  }
  
  //
  // 🎁 REFILL POWER (ADS)
  //
  export function refillPower(game, type) {
    const player = game.currentPlayer;
  
    if (!["undo", "block", "double"].includes(type)) {
      return game; // ✅ safety
    }
  
    return {
      ...game,
      powerUps: {
        ...game.powerUps,
        [player]: {
          ...game.powerUps[player],
          [type]: game.powerUps[player][type] + 1,
        },
      },
    };
  }
  
  //
  // 🔄 PLAYER SWITCH
  //
  function getNextPlayer(game) {
    return game.currentPlayer === game.players[0]
      ? game.players[1]
      : game.players[0];
  }
  
  //
  // 🧠 WIN CHECK (DYNAMIC)
  //
  export function checkWinner(board, size) {
    const winLength = getWinLength(size);
  
    const directions = [
      [0, 1],   // →
      [1, 0],   // ↓
      [1, 1],   // ↘
      [1, -1],  // ↙
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
  
          if (count === winLength) {
            return start;
          }
        }
      }
    }
  
    return null;
  }
  
  //
  // 📏 WIN LENGTH
  //
  function getWinLength(size) {
    if (size <= 3) return 3;
    if (size <= 5) return 4;
    return 5;
  }