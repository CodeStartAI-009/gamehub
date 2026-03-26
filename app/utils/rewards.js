//
// 🎯 XOX / BINGO REWARD
//
export function resultReward(result) {
    switch (result) {
      case "win":
        return 20;
      case "draw":
        return 8;
      case "lose":
      default:
        return 0;
    }
  }
  
  //
  // 🐍 SNAKE REWARD (based on score/length)
  //
  export function snakeReward(score) {
    if (score < 5) return 5;
    if (score < 10) return 10;
    if (score < 20) return 20;
    return 40 + Math.floor(score / 2);
  }
  
  //
  // 🔢 SUDOKU REWARD (progress-based)
  // filledCells = how many user filled correctly
  //
  export function sudokuReward(filled, total = 81) {
    const progress = filled / total;
  
    if (progress === 1) return 50; // full win
    if (progress > 0.75) return 30;
    if (progress > 0.5) return 15;
    if (progress > 0.25) return 8;
  
    return 2;
  }
  
  //
  // 🔲 2048 REWARD (tile-based scaling)
  //
  export function reward2048(score) {
    if (score < 500) return 5;
    if (score < 1500) return 15;
    if (score < 3000) return 30;
    return 50 + Math.floor(score / 500);
  }