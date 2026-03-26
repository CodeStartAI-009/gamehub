// app/games/xox/XOX.jsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  BackHandler,
  Image,
} from "react-native";

import {
  createGame,
  makeMove,
  undoMove,
  blockCell,
  refillPower,
  activateDoubleMove,
} from "./XOXEngine";

import { showRewardAd } from "../../utils/ads";
import { getBestMove } from "./XOXAI";
import { useGameStore } from "../../store/useGameStore";
import { useRouter } from "expo-router";
import { useBackgroundStore } from "../../store/useBackgroundStore";
//
// 🎯 SIMPLE REWARD SYSTEM
//
const getReward = (game, player, aiPlayer) => {
  if (game.winner === player) return 20;
  if (game.isDraw) return 8;
  return 0;
};

export default function XOX({
  size = 3,
  vsAI = true,
  difficulty = "medium",
}) {
  const router = useRouter();

  const [game, setGame] = useState(createGame(size));
  const [blockMode, setBlockMode] = useState(false);
  const [loadingAd, setLoadingAd] = useState(false);

  const [reward, setReward] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showExit, setShowExit] = useState(false);

  const addCoins = useGameStore((s) => s.addCoins);

  const aiPlayer = "O";
  const player = "X";
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
  // 🤖 AI TURN
  //
  useEffect(() => {
    if (
      vsAI &&
      game.currentPlayer === aiPlayer &&
      !game.winner &&
      !game.isDraw
    ) {
      const timer = setTimeout(() => {
        setGame((prev) => {
          const move = getBestMove(prev, aiPlayer, difficulty);
          return makeMove(prev, move);
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [game.currentPlayer]);

  //
  // 🏆 REWARD SYSTEM (FIXED)
  //
  useEffect(() => {
    if ((game.winner || game.isDraw) && !showResult) {
      const r = getReward(game, player, aiPlayer);

      setReward(r);
      addCoins(r); // ✅ SAVE FIRST
      setShowResult(true);
    }
  }, [game.winner, game.isDraw]);

  //
  // 🎯 MOVE
  //
  const handlePress = (index) => {
    if (
      game.winner ||
      game.isDraw ||
      (vsAI && game.currentPlayer === aiPlayer)
    ) return;

    if (blockMode) {
      setGame((prev) => blockCell(prev, index));
      setBlockMode(false);
      return;
    }

    setGame((prev) => makeMove(prev, index));
  };

  //
  // 🎥 ADS
  //
  const handleAdReward = async (type) => {
    if (loadingAd) return;

    setLoadingAd(true);
    const ok = await showRewardAd();

    if (ok) {
      setGame((prev) => refillPower(prev, type));
    }

    setLoadingAd(false);
  };

  //
  // 🔁 CONTINUE
  //
  const handleContinue = () => {
    setGame(createGame(size));
    setShowResult(false);
    setReward(0);
    setBlockMode(false);
  };

  //
  // 🔙 EXIT HANDLING
  //
  const handleExitPress = () => {
    if (showResult) return false;
    setShowExit(true);
    return true;
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener(
      "hardwareBackPress",
      handleExitPress
    );

    return () => sub.remove();
  }, [showResult]);

  const confirmExit = () => {
    setShowExit(false);

    setTimeout(() => {
      router.replace("/");
    }, 50);
  };

  const cancelExit = () => {
    setShowExit(false);
  };

  const currentPower = game.powerUps[game.currentPlayer];

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
  
          <Text style={styles.status}>
            {game.winner
              ? `Winner: ${game.winner}`
              : game.isDraw
              ? "Draw!"
              : `Turn: ${game.currentPlayer}`}
          </Text>
        </View>
  
        {/* BOARD */}
        <View style={[styles.board, { width: size * 70 }]}>
          {game.board.map((cell, i) => {
            const isBlocked = game.blocked[i];
  
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.cell,
                  { width: 70, height: 70 },
                  isBlocked && { backgroundColor: "#444" },
                ]}
                onPress={() => handlePress(i)}
              >
                <Text style={styles.cellText}>
                  {isBlocked ? "❌" : cell}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
  
        {/* POWERS */}
        <View style={styles.powerRow}>
          <TouchableOpacity
            onPress={() =>
              currentPower.undo > 0
                ? setGame((p) => undoMove(p))
                : handleAdReward("undo")
            }
          >
            <Text style={styles.powerText}>Undo</Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            onPress={() =>
              currentPower.block > 0
                ? setBlockMode(true)
                : handleAdReward("block")
            }
          >
            <Text style={styles.powerText}>Block</Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            onPress={() =>
              currentPower.double > 0
                ? setGame((p) => activateDoubleMove(p))
                : handleAdReward("double")
            }
          >
            <Text style={styles.powerText}>Double</Text>
          </TouchableOpacity>
        </View>
  
        {loadingAd && <ActivityIndicator color="#fff" />}
      </View>
  
      {/* 🏆 RESULT MODAL */}
      <Modal visible={showResult} transparent animationType="fade">
        <View style={styles.modal}>
          <View style={styles.card}>
            <Text style={styles.resultText}>
              {game.winner ? `Winner: ${game.winner}` : "Draw"}
            </Text>
  
            <Text style={styles.coins}>+{reward} Coins</Text>
  
            <TouchableOpacity style={styles.btn} onPress={handleContinue}>
              <Text style={styles.btnText}>Continue</Text>
            </TouchableOpacity>
  
            <TouchableOpacity style={styles.btn} onPress={confirmExit}>
              <Text style={styles.btnText}>Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  
      {/* 🚪 EXIT MODAL */}
      <Modal visible={showExit} transparent animationType="fade">
        <View style={styles.modal}>
          <View style={styles.card}>
            <Text style={styles.resultText}>Leave Game?</Text>
  
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
    marginBottom: 20,
  },

  back: {
    color: "#fff",
    fontSize: 18,
  },

  status: {
    color: "#fff",
    fontSize: 18,
  },

  board: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "rgb(255, 255, 255)",
  },

  cell: {
    borderWidth: 1,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },

  cellText: {
    color: "rgb(2, 0, 0)",
    fontSize: 26,
  },

  powerRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 20,
  },

  powerText: {
    color: "#ffd700",
  },

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

  resultText: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 10,
  },

  coins: {
    color: "#ffd700",
    marginBottom: 15,
  },

  btn: {
    backgroundColor: "#444",
    padding: 12,
    marginVertical: 5,
    width: "100%",
    borderRadius: 8,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
  },
});