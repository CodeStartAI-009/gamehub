// app/game.jsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

import XOX from "./games/xox/XOX";
import Game2048 from "./games/2048/2048"; // ✅ fixed name
import Snake from "./games/snake/Snake";
import Sudoku from "./games/sudoku/Sudoku";
import Bingo from "./games/bingo/Bingo";

export default function Game() {
  const params = useLocalSearchParams();

  const game = params.game?.toString();
  const mode = params.mode?.toString();
  const size = parseInt(params.size || "3");

  //
  // 🎮 XOX
  //
  if (game === "xox") {
    return (
      <XOX
        size={size}
        vsAI={mode === "ai"}
        difficulty="medium"
      />
    );
  }

  //
  // 🎮 2048
  //
  if (game === "2048") {
    return <Game2048 />;
  }
 if(game==="sudoku"){
    return <Sudoku/>;
 }
  //
  // 🎮 SNAKE ✅ (FIXED)
  //
  if (game === "snake") {
    return <Snake />;
  }

  //
  // 🎮 BINGO (future)
  //
  if (game === "bingo") {
    return <Bingo/>;
  }

  //
  // ❌ UNKNOWN GAME
  //
  return (
    <View style={styles.center}>
      <Text style={styles.text}>Game not found ❌</Text>
    </View>
  );
}

//
// 🎨 STYLES
//
const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    color: "#fff",
    fontSize: 18,
  },
});