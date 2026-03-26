// app/games/snake/Snake.jsx

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  TouchableOpacity,
  Modal,
  Image,
  BackHandler,
} from "react-native";
import { useRouter } from "expo-router";

import { createGame, tick, setDirection } from "./engine";
import { useSnakeStore } from "../../store/useSnakeStore";
import { useGameStore } from "../../store/useGameStore";
import { showRewardAd } from "../../utils/ads";
import { useBackgroundStore } from "../../store/useBackgroundStore";
//
// 🎯 REWARD SYSTEM
//
const snakeReward = (score) => {
  if (score < 5) return 5;
  if (score < 10) return 10;
  if (score < 20) return 20;
  return 40 + Math.floor(score / 2);
};

export default function Snake() {
  const router = useRouter();

  const { level, nextLevel, skipLevel, load } = useSnakeStore();
  const addCoins = useGameStore((s) => s.addCoins);

  const [game, setGame] = useState(createGame(1));
  const [running, setRunning] = useState(true);

  const [reward, setReward] = useState(0);
  const [showExit, setShowExit] = useState(false);

  const loopRef = useRef(null);
  const selectedBg = useBackgroundStore((s) => s.selected);

  const bgMap = {
    wood: require("../../../assets/game/background/wood.png"),
    dessert: require("../../../assets/game/background/dessert.png"),
    fairy: require("../../../assets/game/background/fairy.png"),
    prack: require("../../../assets/game/background/prack.png"),
    race: require("../../../assets/game/background/race.png"),
    ship: require("../../../assets/game/background/ship.png"),
    snow: require("../../../assets/game/background/snow.png"),
    space: require("../../../assets/game/background/space.png"),
    village: require("../../../assets/game/background/village.png"),
  };
  const foodImg = require("../../../assets/game/snake/apple.png");
  //
  // 🔄 LOAD LEVEL
  //
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    resetGame(level);
  }, [level]);

  //
  // 🎮 GAME LOOP
  //
  useEffect(() => {
    if (!running) return;

    loopRef.current = setInterval(() => {
      setGame((prev) => tick(prev));
    }, game.speed);

    return () => clearInterval(loopRef.current);
  }, [game.speed, running]);

  //
  // 🛑 GAME END (🔥 FIXED)
  //
  useEffect(() => {
    if (game.status !== "playing") {
      setRunning(false);

      const baseCoins = snakeReward(game.score);
      let coins = 0;

      if (game.status === "win") {
        coins = baseCoins; // 100%
      } else if (game.status === "lose") {
        coins = Math.max(5, Math.floor(baseCoins * 0.6)); // 🔥 LOSE REWARD
      }

      if (coins > 0) {
        setReward(coins);
        addCoins(coins);
      }
    }
  }, [game.status]);

  //
  // 🔁 RESET
  //
  const resetGame = (lvl) => {
    setGame(createGame(lvl));
    setRunning(true);
  };

  //
  // 👉 CONTROLS
  //
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, g) => {
        const { dx, dy } = g;

        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 20) changeDir("RIGHT");
          else if (dx < -20) changeDir("LEFT");
        } else {
          if (dy > 20) changeDir("DOWN");
          else if (dy < -20) changeDir("UP");
        }
      },
    })
  ).current;

  const changeDir = (dir) => {
    setGame((prev) => setDirection(prev, dir));
  };

  //
  // 🔙 EXIT HANDLER
  //
  const handleExitPress = () => {
    if (game.status !== "playing") return false;
    setShowExit(true);
    return true;
  };

  //
  // 📱 ANDROID BACK
  //
  useEffect(() => {
    const sub = BackHandler.addEventListener(
      "hardwareBackPress",
      handleExitPress
    );
    return () => sub.remove();
  }, [game.status]);

  //
  // 🏠 CONFIRM EXIT (WITH COINS)
  //
  const confirmExit = () => {
    setShowExit(false);

    if (game.status === "playing") {
      const coins = Math.floor(snakeReward(game.score) * 0.4);
      if (coins > 0) addCoins(coins);
    }

    setRunning(false);

    setTimeout(() => {
      router.replace("/");
    }, 50);
  };

  const cancelExit = () => {
    setShowExit(false);
  };

  //
  // 🏆 ACTIONS
  //
  const onNext = () => {
    nextLevel();
    resetGame(level + 1);
  };

  const onDouble = async () => {
    const ok = await showRewardAd();
    if (ok) {
      addCoins(reward);
      nextLevel();
      resetGame(level + 1);
    }
  };

  const onRetry = () => {
    resetGame(level);
  };

  const onSkip = async () => {
    const ok = await showRewardAd();
    if (ok) {
      skipLevel();
      resetGame(level + 1);
    }
  };

  const goMenu = () => {
    setRunning(false);
    setTimeout(() => {
      router.replace("/");
    }, 50);
  };

  //
  // 🎨 GRID
  //
  const renderCell = (x, y) => {
    const isSnake = game.snake.some((s) => s.x === x && s.y === y);
    const isFood = game.food.x === x && game.food.y === y;
    const isObstacle = game.obstacles.some(
      (o) => o.x === x && o.y === y
    );

    let style = styles.cell;

    if (isFood) {
        return (
          <Image
            key={`${x}-${y}`}
            source={foodImg}
            style={{ width: 16, height: 16 }}
            resizeMode="contain"
          />
        );
      }
      
      if (isSnake) style = styles.snake;
      if (isObstacle) style = styles.obstacle;
      
      return <View key={`${x}-${y}`} style={style} />;
  };

  const renderGrid = () => {
    const cells = [];

    for (let y = 0; y < game.size; y++) {
      for (let x = 0; x < game.size; x++) {
        cells.push(renderCell(x, y));
      }
    }

    return cells;
  };
return(
  <View style={{ flex: 1 }}>
      
  {/* 🖼 BACKGROUND */}
  <Image
    source={bgMap[selectedBg] || bgMap.wood}
    style={styles.bg}
    resizeMode="cover"
  />

  <View style={styles.overlay} />
<View style={styles.container} {...panResponder.panHandlers}>
  
  {/* 🔙 TOP BAR */}
  <View style={styles.topBar}>
    <TouchableOpacity onPress={handleExitPress}>
      <Text style={styles.back}>← Back</Text>
    </TouchableOpacity>

    <Text style={styles.title}>Level {level}</Text>
  </View>

  <Text style={styles.score}>Score: {game.score}</Text>

  <View style={styles.board}>{renderGrid()}</View>

  {/* 🏁 RESULT */}
  <Modal
    visible={game.status === "win" || game.status === "lose"}
    transparent
    animationType="fade"
  >
    <View style={styles.modal}>
      <View style={styles.card}>
        {game.status === "win" ? (
          <>
            <Text style={styles.text}>🎉 Level Complete</Text>
            <Text style={styles.reward}>+{reward} Coins</Text>
          </>
        ) : (
          <>
            <Text style={styles.text}>💀 Game Over</Text>
            <Text style={styles.reward}>+{reward} Coins</Text>
          </>
        )}

        {game.status === "win" ? (
          <>
            <TouchableOpacity style={styles.btn} onPress={onNext}>
              <Text style={styles.btnText}>Next</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={onDouble}>
              <Text style={styles.btnText}>🎥 Double</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.btn} onPress={onRetry}>
              <Text style={styles.btnText}>Retry</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={onSkip}>
              <Text style={styles.btnText}>🎥 Skip</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.btn} onPress={goMenu}>
          <Text style={styles.btnText}>Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>

  {/* 🚪 EXIT */}
  <Modal visible={showExit} transparent animationType="fade">
    <View style={styles.modal}>
      <View style={styles.card}>
        <Text style={styles.text}>Leave Game?</Text>

        <Text style={styles.reward}>
          You get ~{Math.floor(snakeReward(game.score) * 0.4)} coins
        </Text>

        <TouchableOpacity style={styles.btn} onPress={confirmExit}>
          <Text style={styles.btnText}>Yes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={cancelExit}>
          <Text style={styles.btnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
</View>
</View>

    );
}

//
// 🎨 STYLES
//
const styles = StyleSheet.create({
    bg: {
        position: "absolute",
        width: "100%",
        height: "100%",
      },
    
      overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.45)",
      },
    
      container: {
        flex: 1,
        alignItems: "center",
        paddingTop: 60,
      },
  topBar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  back: { color: "#fff", fontSize: 18 },
  title: { color: "#fff", fontSize: 20 },
  score: { color: "#fff", marginBottom: 10 },
  board: {
    width: 320,
    height: 320,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: { width: 16, height: 16, backgroundColor: "#222" },
  snake: { width: 16, height: 16, backgroundColor: "#4caf50" },
  food: { width: 16, height: 16, backgroundColor: "red" },
  obstacle: { width: 16, height: 16, backgroundColor: "#888" },
  modal: {
    flex: 1,
    backgroundColor: "#000a",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#222",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  text: { color: "#fff", marginBottom: 10, fontSize: 18 },
  reward: { color: "#ffd700", marginBottom: 10 },
  btn: {
    backgroundColor: "#444",
    padding: 12,
    marginVertical: 5,
    width: "100%",
    borderRadius: 8,
  },
  btnText: { color: "#fff", textAlign: "center" },
});