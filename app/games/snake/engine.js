// app/games/snake/engine.js

export function createGame(level = 1) {
    const size = 20;
  
    return {
      level,
      size,
  
      snake: [{ x: 10, y: 10 }],
      direction: "RIGHT",
      nextDirection: "RIGHT",
  
      food: spawnFood([], size),
      obstacles: generateObstacles(level, size),
  
      speed: getSpeed(level),
      score: 0,
  
      status: "playing", // playing | win | lose
      target: 10 + level * 5, // food to win level
    };
  }
  
  //
  // 🎯 MOVE TICK
  //
  export function tick(game) {
    if (game.status !== "playing") return game;
  
    const head = game.snake[0];
    const dir = game.nextDirection;
  
    const newHead = moveHead(head, dir);
  
    // ❌ wall collision
    if (
      newHead.x < 0 ||
      newHead.y < 0 ||
      newHead.x >= game.size ||
      newHead.y >= game.size
    ) {
      return { ...game, status: "lose" };
    }
  
    // ❌ self collision
    if (game.snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      return { ...game, status: "lose" };
    }
  
    // ❌ obstacle collision
    if (game.obstacles.some((o) => o.x === newHead.x && o.y === newHead.y)) {
      return { ...game, status: "lose" };
    }
  
    let newSnake = [newHead, ...game.snake];
    let newFood = game.food;
    let newScore = game.score;
  
    // 🍎 eat food
    if (newHead.x === game.food.x && newHead.y === game.food.y) {
      newFood = spawnFood(newSnake, game.size);
      newScore++;
  
      // ✅ WIN CONDITION
      if (newScore >= game.target) {
        return {
          ...game,
          snake: newSnake,
          food: newFood,
          score: newScore,
          status: "win",
        };
      }
    } else {
      newSnake.pop();
    }
  
    return {
      ...game,
      snake: newSnake,
      food: newFood,
      score: newScore,
      direction: dir,
    };
  }
  
  //
  // 🎮 CHANGE DIRECTION
  //
  export function setDirection(game, dir) {
    const opposite = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    };
  
    if (opposite[game.direction] === dir) return game;
  
    return { ...game, nextDirection: dir };
  }
  
  //
  // ⚙️ HELPERS
  //
  function moveHead(head, dir) {
    if (dir === "UP") return { x: head.x, y: head.y - 1 };
    if (dir === "DOWN") return { x: head.x, y: head.y + 1 };
    if (dir === "LEFT") return { x: head.x - 1, y: head.y };
    if (dir === "RIGHT") return { x: head.x + 1, y: head.y };
  }
  
  function spawnFood(snake, size) {
    while (true) {
      const food = {
        x: Math.floor(Math.random() * size),
        y: Math.floor(Math.random() * size),
      };
  
      if (!snake.some((s) => s.x === food.x && s.y === food.y)) {
        return food;
      }
    }
  }
  
  function generateObstacles(level, size) {
    const count = Math.min(level, 10);
  
    const obs = [];
  
    for (let i = 0; i < count; i++) {
      obs.push({
        x: Math.floor(Math.random() * size),
        y: Math.floor(Math.random() * size),
      });
    }
  
    return obs;
  }
  
  function getSpeed(level) {
    return Math.max(200 - level * 10, 80); // ms per tick
  }