// app/games/bingo/Bingo.jsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  BackHandler,
  StyleSheet,
  Image, // ✅ added
} from "react-native";
import { useRouter } from "expo-router";

import { createGame, applyMove } from "./engine";
import { getAIMove } from "./ai.js";
import { useGameStore } from "../../store/useGameStore";
import { useBackgroundStore } from "../../store/useBackgroundStore";

export default function Bingo() {
  const router = useRouter();
  const addCoins = useGameStore((s) => s.addCoins);

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

  const [game, setGame] = useState(createGame(5));
  const [showExit, setShowExit] = useState(false);
  const [reward, setReward] = useState(0);

  //
  // 🤖 AI TURN
  //
  useEffect(() => {
    if (game.turn === "ai" && game.status === "playing") {
      setTimeout(() => {
        const move = getAIMove(game, "medium");
        setGame((g) => applyMove(g, move));
      }, 500);
    }
  }, [game]);

  //
  // 🏆 WIN REWARD
  //
  useEffect(() => {
    if (game.status !== "playing") {
      if (game.status === "player") {
        const coins = 20;
        setReward(coins);
        addCoins(coins);
      }
    }
  }, [game.status]);

  //
  // 🔙 BACK
  //
  const handleExitPress = () => {
    if (game.status !== "playing") return false;
    setShowExit(true);
    return true;
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener(
      "hardwareBackPress",
      handleExitPress
    );
    return () => sub.remove();
  }, [game.status]);

  //
  // 🏠 EXIT
  //
  const confirmExit = () => {
    setShowExit(false);
    router.replace("/");
  };

  const cancelExit = () => {
    setShowExit(false);
  };

  //
  // 👤 MOVE
  //
  const play = (num) => {
    if (game.turn !== "player") return;
    if (game.status !== "playing") return;

    setGame((g) => applyMove(g, num));
  };

  //
  // 🎮 BOARD
  //
  const renderBoard = () => {
    return game.playerBoard.map((n, i) => (
      <TouchableOpacity
        key={i}
        onPress={() => play(n)}
        style={[
          styles.cell,
          game.playerMarked[i] && styles.marked,
        ]}
      >
        <Text style={styles.cellText}>{n}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={{ flex: 1 }}>
      
      {/* 🖼 BACKGROUND */}
      <Image
        source={bgMap[selectedBg] || bgMap.wood}
        style={styles.bgImage}
        resizeMode="cover"
      />

      {/* 🌑 OVERLAY */}
      <View style={styles.overlay} />

      <View style={styles.container}>
        
        {/* 🔝 TOP */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleExitPress}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.score}>
            Player: {game.playerLines} | AI: {game.aiLines}
          </Text>
        </View>

        {/* BOARD */}
        <View style={styles.board}>
          {renderBoard()}
        </View>

        {/* RESULT */}
        {game.status !== "playing" && (
          <View style={styles.result}>
            <Text style={styles.resultText}>
              {game.status === "player"
                ? "You Win 🎉"
                : "AI Wins 🤖"}
            </Text>

            {game.status === "player" && (
              <Text style={styles.reward}>
                +{reward} Coins
              </Text>
            )}

            <TouchableOpacity
              style={styles.btn}
              onPress={() => router.replace("/")}
            >
              <Text style={styles.btnText}>Menu</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* EXIT */}
      <Modal visible={showExit} transparent>
        <View style={styles.modal}>
          <View style={styles.card}>
            <Text style={styles.title}>Leave Game?</Text>

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
// 🎨 STYLES (UPGRADED)
//
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: "center",
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
    fontSize: 20,
  },

  score: {
    color: "#fff",
    fontWeight: "600",
  },

  board: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 330,
    padding: 5,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  bgImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  cell: {
    width: 60,
    height: 60,
    margin: 2,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  marked: {
    backgroundColor: "#22c55e",
  },

  cellText: {
    color: "#fff",
    fontWeight: "bold",
  },

  result: {
    marginTop: 20,
    alignItems: "center",
  },

  resultText: {
    color: "#fff",
    fontSize: 18,
  },

  reward: {
    color: "#facc15",
    marginTop: 5,
  },

  btn: {
    backgroundColor: "#1e40af",
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
    width: 140,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
  },

  modal: {
    flex: 1,
    backgroundColor: "#000a",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 14,
    width: "80%",
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 15,
  },
});