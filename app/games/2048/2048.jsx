// app/games/2048/Game2048.jsx

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  PanResponder,
  BackHandler,
  Image, 
} from "react-native";

import {
  createGame,
  move,
  undo,
  shuffle,
  blast,
  isGameOver,
} from "./engine";

import { useGameStore } from "../../store/useGameStore";
import { showRewardAd } from "../../utils/ads";
import { useRouter } from "expo-router";
import { useBackgroundStore } from "../../store/useBackgroundStore";
//
// 🎯 REWARD SYSTEM
//
const reward2048 = (score) => {
  if (score < 500) return 5;
  if (score < 1500) return 15;
  if (score < 3000) return 30;
  return 50 + Math.floor(score / 500);
};
const getTileColor = (v) => {
  switch (v) {
    case 2: return "#eee4da";
    case 4: return "#ede0c8";
    case 8: return "#f2b179";
    case 16: return "#f59563";
    case 32: return "#f67c5f";
    case 64: return "#f65e3b";
    case 128: return "#edcf72";
    case 256: return "#edcc61";
    case 512: return "#edc850";
    case 1024: return "#edc53f";
    case 2048: return "#edc22e";
    default: return "rgba(255,255,255,0.08)";
  }
};
export default function Game2048() {
  const router = useRouter();

  const [game, setGame] = useState(createGame());
  const [blastMode, setBlastMode] = useState(false);

  const [showEnd, setShowEnd] = useState(false);
  const [reward, setReward] = useState(0);

  const [showExit, setShowExit] = useState(false);
  const [loadingAd, setLoadingAd] = useState(false);

  const addCoins = useGameStore((s) => s.addCoins);
  const spendCoins = useGameStore((s) => s.spendCoins);
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
  //
  // 🎮 MOVE
  //
  const handleMove = (dir) => {
    setGame((prev) => {
      const next = move(prev, dir);

      if (next === prev) return prev;

      // ✅ GAME OVER REWARD
      if (isGameOver(next.board) && !showEnd) {
        const coins = reward2048(next.score);

        setReward(coins);
        addCoins(coins); // 🔥 SAVE FIRST
        setShowEnd(true);
      }

      return next;
    });
  };

  //
  // 👉 SWIPE
  //
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, g) => {
        if (blastMode) return;

        const { dx, dy } = g;

        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 30) handleMove("right");
          else if (dx < -30) handleMove("left");
        } else {
          if (dy > 30) handleMove("down");
          else if (dy < -30) handleMove("up");
        }
      },
    })
  ).current;

  //
  // 🔙 EXIT HANDLER
  //
  const handleExitPress = () => {
    if (showEnd) return;
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
  }, [showEnd]);

  //
  // 🏠 CONFIRM EXIT (🔥 FIXED)
  //
  const confirmExit = () => {
    setShowExit(false);

    // ✅ GIVE PARTIAL COINS
    if (!showEnd) {
      const partial = Math.floor(reward2048(game.score) * 0.4);

      if (partial > 0) {
        addCoins(partial);
      }
    }

    setTimeout(() => {
      router.replace("/");
    }, 50);
  };

  const cancelExit = () => {
    setShowExit(false);
  };

  //
  // 🎥 POWER SYSTEM
  //
  const refillPower = async (type) => {
    if (loadingAd) return;

    setLoadingAd(true);
    const ok = await showRewardAd();

    if (ok) {
      setGame((prev) => ({
        ...prev,
        powerUps: {
          ...prev.powerUps,
          [type]: prev.powerUps[type] + 1,
        },
      }));
    }

    setLoadingAd(false);
  };

  const handleUndo = () => {
    if (game.powerUps.undo > 0) {
      setGame((prev) => undo(prev));
    } else refillPower("undo");
  };

  const handleShuffle = () => {
    if (game.powerUps.shuffle > 0) {
      setGame((prev) => shuffle(prev));
    } else refillPower("shuffle");
  };

  const handleBlast = (index) => {
    if (!blastMode) return;

    if (game.powerUps.blast <= 0) {
      setBlastMode(false);
      return;
    }

    setGame((prev) => blast(prev, index));
    setBlastMode(false);
  };

  const activateBlast = () => {
    if (game.powerUps.blast > 0) {
      setBlastMode(true);
    } else refillPower("blast");
  };

  //
  // 🎥 DOUBLE REWARD
  //
  const handleDoubleReward = async () => {
    if (loadingAd) return;

    setLoadingAd(true);
    const ok = await showRewardAd();

    if (ok) addCoins(reward);

    setLoadingAd(false);
    handleNewGame();
  };

  //
  // 🔁 RESET
  //
  const handleNewGame = () => {
    setGame(createGame());
    setShowEnd(false);
    setReward(0);
    setBlastMode(false);
  };

  //
  // 🎥 CONTINUE
  //
  const continueWithAd = async () => {
    if (loadingAd) return;

    setLoadingAd(true);
    const ok = await showRewardAd();

    if (ok) setShowEnd(false);

    setLoadingAd(false);
  };

  const continueWithCoins = () => {
    spendCoins(50);
    setShowEnd(false);
  };

  return (
    <View style={{ flex: 1 }}>
      
      {/* 🖼 BACKGROUND */}
      <Image
        source={bgMap[selectedBg] || bgMap.wood}
        style={styles.bg}
        resizeMode="cover"
      />
      {/* 🌑 DARK OVERLAY */}
      <View style={styles.overlay} />
  
      {/* 🎮 MAIN */}
      <View style={styles.container}>
        
        {/* 🔝 TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleExitPress}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
  
          <Text style={styles.score}>Score: {game.score}</Text>
        </View>
  
        {/* 🎮 BOARD */}
        <View style={styles.board} {...panResponder.panHandlers}>
          {game.board.map((v, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.cell,
                { backgroundColor: getTileColor(v) },
                blastMode && styles.blastCell,
              ]}
              onPress={() => handleBlast(i)}
            >
              <Text style={styles.cellText}>{v || ""}</Text>
            </TouchableOpacity>
          ))}
        </View>
  
        {/* ⚡ POWERS */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.powerBtn} onPress={handleUndo}>
            <Text style={styles.power}>↩ Undo</Text>
          </TouchableOpacity>
  
          <TouchableOpacity style={styles.powerBtn} onPress={handleShuffle}>
            <Text style={styles.power}>🔀 Shuffle</Text>
          </TouchableOpacity>
  
          <TouchableOpacity style={styles.powerBtn} onPress={activateBlast}>
            <Text style={styles.power}>💥 Blast</Text>
          </TouchableOpacity>
        </View>
      </View>
  
      {/* 🎯 GAME OVER */}
      <Modal visible={showEnd} transparent animationType="fade">
        <View style={styles.modal}>
          <View style={styles.card}>
            <Text style={styles.title}>Game Over</Text>
  
            <Text style={styles.reward}>+{reward} Coins</Text>
  
            <TouchableOpacity style={styles.btnBox} onPress={handleNewGame}>
              <Text style={styles.btnText}>New Game</Text>
            </TouchableOpacity>
  
            <TouchableOpacity style={styles.btnBox} onPress={handleDoubleReward}>
              <Text style={styles.btnText}>🎥 Double Reward</Text>
            </TouchableOpacity>
  
            <TouchableOpacity style={styles.btnBox} onPress={confirmExit}>
              <Text style={styles.btnText}>Menu</Text>
            </TouchableOpacity>
  
            {loadingAd && <ActivityIndicator color="#fff" />}
          </View>
        </View>
      </Modal>
  
      {/* 🚪 EXIT */}
      <Modal visible={showExit} transparent animationType="fade">
        <View style={styles.modal}>
          <View style={styles.card}>
            <Text style={styles.title}>Leave Game?</Text>
  
            <Text style={styles.exitReward}>
              You will get ~{Math.floor(reward2048(game.score) * 0.4)} coins
            </Text>
  
            <TouchableOpacity style={styles.btnBox} onPress={confirmExit}>
              <Text style={styles.btnText}>Yes</Text>
            </TouchableOpacity>
  
            <TouchableOpacity style={styles.btnBox} onPress={cancelExit}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: "center",
  },
  topBar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  back: { color: "rgb(255, 255, 255)", fontSize: 18 },
  score: { color: "rgb(255, 255, 255)", fontSize: 18 },
  board: {
     
    flexDirection: "row",
    flexWrap: "wrap",
    width: 320,
    backgroundColor:"rgb(255, 255, 255)"
  },
  cell: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    color:"white",
  },
  cellText: { color: "black", fontSize: 18 },
  controls: { flexDirection: "row", marginTop: 10 },
  power: { color: "#ffd700", marginHorizontal: 10 },
  modal: {
    flex: 1,
    backgroundColor: "#000a",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "gray",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  title: { color: "#fff", fontSize: 20, marginBottom: 10 },
  reward: { color: "#ffd700", fontSize: 18, marginBottom: 20 },
  btnBox: {
    backgroundColor: "#444",
    padding: 12,
    marginVertical: 5,
    width: "100%",
    borderRadius: 8,
    color: "blue",
  },
  btnText: { color: "#fff", textAlign: "center" },
});