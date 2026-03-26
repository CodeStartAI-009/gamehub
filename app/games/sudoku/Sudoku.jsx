// app/games/sudoku/Sudoku.jsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  BackHandler,
} from "react-native";
import { useRouter } from "expo-router";

import {
  createGame,
  setNumber,
  toggleNote,
  undo,
  useHint,
} from "./engine";

import { EASY } from "./puzzles";
import { useGameStore } from "../../store/useGameStore";
import { showRewardAd } from "../../utils/ads";
import { useBackgroundStore } from "../../store/useBackgroundStore";
export default function Sudoku() {
  const router = useRouter();
  const { addCoins, spendCoins, coins } = useGameStore();

  const puzzleData = EASY[0];

  const [game, setGame] = useState(
    createGame(puzzleData.puzzle, puzzleData.solution, "easy")
  );

  const [noteMode, setNoteMode] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showExit, setShowExit] = useState(false);

  const [score, setScore] = useState(0);
  const [reward, setReward] = useState(0);
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
  // 🔙 BACK HANDLER
  //
  const handleExitPress = () => {
    if (showWin) return false;
    setShowExit(true);
    return true;
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener(
      "hardwareBackPress",
      handleExitPress
    );
    return () => sub.remove();
  }, [showWin]);

  //
  // 🏠 CONFIRM EXIT (💰 SCORE BASED)
  //
  const confirmExit = () => {
    setShowExit(false);

    // ✅ GIVE PARTIAL BASED ON SCORE
    const coins = Math.floor(score * 0.5);

    if (coins > 0) addCoins(coins);

    setTimeout(() => {
      router.replace("/");
    }, 50);
  };

  const cancelExit = () => {
    setShowExit(false);
  };

  //
  // 📍 SELECT
  //
  const selectCell = (i) => {
    if (game.puzzle[i] !== 0) return;
    setGame((g) => ({ ...g, selectedCell: i }));
  };

  //
  // 🔢 INPUT
  //
  const inputNumber = (n) => {
    if (game.selectedCell === null) return;

    if (noteMode) {
      setGame((g) => toggleNote(g, g.selectedCell, n));
      return;
    }

    const index = game.selectedCell;
    const correctValue = game.solution[index];

    const newGame = setNumber(game, index, n);
    setGame(newGame);

    // ✅ CORRECT MOVE
    if (n === correctValue) {
      const coins = 2;
      addCoins(coins);
      setScore((s) => s + coins);
    }

    // 🏆 WIN BONUS
    if (newGame.status === "win") {
      const bonus = 30;

      setReward(score + bonus);
      addCoins(bonus);

      setShowWin(true);
    }
  };

  //
  // ❌ CLEAR
  //
  const clearCell = () => {
    if (game.selectedCell === null) return;

    const newBoard = [...game.board];
    newBoard[game.selectedCell] = 0;

    setGame((g) => ({
      ...g,
      board: newBoard,
    }));
  };

  //
  // 💡 HINT
  //
  const handleHint = async () => {
    if (coins >= 10) {
      spendCoins(10);
      setGame((g) => useHint(g));
    } else {
      const ok = await showRewardAd();
      if (ok) setGame((g) => useHint(g));
    }
  };

  //
  // 🏠 MENU
  //
  const goMenu = () => {
    setShowWin(false);
    router.replace("/");
  };

  //
  // 🎨 CELL
  //
  const renderCell = (value, i) => {
    const isFixed = game.puzzle[i] !== 0;

    return (
      <TouchableOpacity
        key={i}
        style={[styles.cell, isFixed && styles.fixed]}
        onPress={() => selectCell(i)}
      >
        <Text style={styles.text}>{value || ""}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      
      {/* 🖼 BACKGROUND */}
      <Image
        source={bgMap[selectedBg] || bgMap.wood}
        style={styles.bg}
        resizeMode="cover"
      />
  
      {/* 🌑 OVERLAY */}
      <View style={styles.overlay} />
  
      {/* 🎮 MAIN */}
      <View style={styles.container}>
        
        {/* 🔙 TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleExitPress}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
  
          <Text style={styles.title}>Sudoku</Text>
        </View>
  
        {/* SCORE */}
        <Text style={styles.score}>Score: {score}</Text>
  
        {/* GRID */}
        <View style={styles.grid}>
          {game.board.map((v, i) => renderCell(v, i))}
        </View>
  
        {/* INPUT */}
        <View style={styles.numbers}>
          {[1,2,3,4,5,6,7,8,9].map((n) => (
            <TouchableOpacity
              key={n}
              style={styles.numBtn}
              onPress={() => inputNumber(n)}
            >
              <Text style={styles.numText}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
  
        {/* ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => setGame(undo(game))}>
            <Text style={styles.action}>Undo</Text>
          </TouchableOpacity>
  
          <TouchableOpacity onPress={handleHint}>
            <Text style={styles.action}>Hint</Text>
          </TouchableOpacity>
  
          <TouchableOpacity onPress={clearCell}>
            <Text style={styles.action}>Clear</Text>
          </TouchableOpacity>
  
          <TouchableOpacity onPress={() => setNoteMode(!noteMode)}>
            <Text style={styles.action}>
              {noteMode ? "Notes ON" : "Notes OFF"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
  
      {/* 🏆 WIN */}
      <Modal visible={showWin} transparent>
        <View style={styles.modal}>
          <View style={styles.card}>
            <Text style={styles.win}>🎉 Completed!</Text>
  
            <Text style={styles.reward}>
              +{reward} Coins
            </Text>
  
            <TouchableOpacity style={styles.btn} onPress={goMenu}>
              <Text style={styles.btnText}>Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  
      {/* 🚪 EXIT */}
      <Modal visible={showExit} transparent>
        <View style={styles.modal}>
          <View style={styles.card}>
            <Text style={styles.win}>Leave Game?</Text>
  
            <Text style={styles.reward}>
              You get ~{Math.floor(score * 0.5)} coins
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
    alignItems: "center",
    paddingTop: 50,
  },
  topBar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  back: { color: "#fff", fontSize: 18 },
  title: { color: "#fff", fontSize: 22 },
  score: { color: "#ffd700", marginBottom: 10 },
  grid: {
    width: 324,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: 36,
    height: 36,
    borderWidth: 0.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222",
  },
  fixed: {
    backgroundColor: "#111",
  },
  text: { color: "#fff", fontSize: 16 },
  numbers: {
    flexDirection: "row",
    marginTop: 20,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  numBtn: {
    margin: 5,
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 6,
  },
  numText: { color: "#fff", fontSize: 16 },
  actions: {
    flexDirection: "row",
    marginTop: 15,
    gap: 15,
  },
  action: { color: "#fff" },
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
    alignItems: "center",
  },
  win: { color: "#fff", fontSize: 20, marginBottom: 10 },
  reward: { color: "#ffd700", marginBottom: 10 },
  btn: {
    backgroundColor: "#444",
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
    width: 120,
  },
  btnText: { color: "#fff", textAlign: "center" },
});