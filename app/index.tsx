// app/index.jsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useGameStore } from "./store/useGameStore";

export default function Home() {
  const router = useRouter();
  const coins = useGameStore((s) => s.coins);

  const goToGame = (game:string) => {
    router.push({
      pathname: "/mode",
      params: { game },
    });
  };

  const games = [
    { title: "XOX", game: "xox", image: require("../assets/game/xox.png") },
    { title: "Snake", game: "snake", image: require("../assets/game/snake.png") },
    { title: "2048", game: "2048", image: require("../assets/game/2048.png") },
    { title: "Sudoku", game: "sudoku", image: require("../assets/game/sudoku.png") },
    { title: "Bingo", game: "bingo", image: require("../assets/game/bingo.png") },
  ];

  return (
    <View style={{ flex: 1 }}>
      
      {/* 🔵 BACKGROUND */}
      <LinearGradient
        colors={["#3b82f6", "#1e3a8a", "#020617"]}
        style={StyleSheet.absoluteFill}
      />

      {/* 🌟 LIGHT EFFECT */}
      <LinearGradient
        colors={[
          "rgba(33, 100, 242, 0.6)",
          "rgba(10, 44, 122, 0.6)",
          "transparent",
        ]}
        style={styles.topLight}
      />

      {/* 🟦 GRID BACKGROUND */}
      <View style={styles.gridWrapper}>
        {Array.from({ length: 12 }).map((_, row) => (
          <View key={row} style={styles.gridRow}>
            {Array.from({ length: 8 }).map((_, col) => (
              <View
                key={col}
                style={[
                  styles.gridCell,
                  (row + col) % 2 === 0
                    ? styles.gridLight
                    : styles.gridDark,
                ]}
              />
            ))}
          </View>
        ))}
      </View>

      {/* 🌑 VIGNETTE */}
      <View style={styles.vignette} />

      {/* 🎮 MAIN UI */}
      <View style={styles.container}>

        {/* 🔝 TOP BAR */}
        <View style={styles.topBar}>
          <Text style={styles.title}>🎮 Game Hub</Text>

          <View style={styles.rightBox}>
            {/* 🪙 COINS */}
            <View style={styles.coinBox}>
              <Text style={styles.coinText}>🪙 {coins}</Text>
            </View>

            {/* 🛒 STORE BUTTON */}
            <TouchableOpacity
              style={styles.storeBtn}
              onPress={() => router.push("/stores" as any)}
            >
              <Text style={styles.storeIcon}>🛒</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 🖼 LOGO */}
        <Image
          source={require("../assets/game/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* 🎮 GAME GRID */}
        <View style={styles.grid}>

          {/* 🔹 FIRST ROW */}
          <View style={styles.row}>
            {games.slice(0, 3).map((item) => (
              <TouchableOpacity
                key={item.game}
                style={styles.card}
                onPress={() => goToGame(item.game)}
              >
                <Image source={item.image} style={styles.image} />
                <Text style={styles.gameText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 🔹 SECOND ROW */}
          <View style={styles.bottomRow}>
            {games.slice(3).map((item) => (
              <TouchableOpacity
                key={item.game}
                style={styles.card}
                onPress={() => goToGame(item.game)}
              >
                <Image source={item.image} style={styles.image} />
                <Text style={styles.gameText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

        </View>
      </View>
    </View>
  );
}

//
// 🎨 STYLES
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  topLight: {
    position: "absolute",
    top: -100,
    left: -100,
    right: -100,
    height: 300,
    borderRadius: 300,
    opacity: 0.7,
  },

  gridWrapper: {
    position: "absolute",
    width: "120%",
    height: "120%",
    transform: [{ rotate: "2deg" }],
    left: "-10%",
    top: "-10%",
    opacity: 0.25,
  },

  gridRow: {
    flex: 1,
    flexDirection: "row",
  },

  gridCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.3)",
  },

  gridLight: {
    backgroundColor: "rgba(140,174,255,0.2)",
  },

  gridDark: {
    backgroundColor: "rgba(1,27,87,0.2)",
  },

  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 50,
  },

  title: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "bold",
  },

  rightBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  coinBox: {
    backgroundColor: "#ffb703",
    padding: 10,
    borderRadius: 12,
  },

  coinText: {
    fontWeight: "900",
    color: "#000",
  },

  storeBtn: {
    backgroundColor: "#1e40af",
    padding: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },

  storeIcon: {
    fontSize: 16,
    color: "#fff",
  },

  logo: {
    width: "100%",
    height: 180,
    marginVertical: 20,
    alignSelf: "center",
  },

  grid: {
    marginTop: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
  },

  card: {
    width: "30%",
    height: 120,
    backgroundColor: "#1e40af",
    borderRadius: 16,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },

  image: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },

  gameText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});