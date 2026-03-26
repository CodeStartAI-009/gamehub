// app/mode.jsx

import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function Mode() {
  const { game } = useLocalSearchParams();
  const router = useRouter();

  //
  // 🔙 BACK HANDLER
  //
  const goBack = () => {
    router.replace("/");
    return true;
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener(
      "hardwareBackPress",
      goBack
    );
    return () => sub.remove();
  }, []);

  //
  // 🚀 AUTO REDIRECT
  //
  useEffect(() => {
    if (game !== "xox") {
      router.replace({
        pathname: "/game",
        params: { game, mode: "single" },
      });
    }
  }, []);

  //
  // 🎮 NAV
  //
  const go = (mode) => {
    router.push({
      pathname: "/size",
      params: { game, mode },
    });
  };

  //
  // ⏳ LOADING
  //
  if (game !== "xox") {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      
      {/* 🔵 BACKGROUND */}
      <LinearGradient
        colors={["#3b82f6", "#1e3a8a", "#020617"]}
        style={StyleSheet.absoluteFill}
      />

      {/* 🌟 LIGHT */}
      <LinearGradient
        colors={[
          "rgba(33, 100, 242, 0.6)",
          "rgba(10, 44, 122, 0.6)",
          "transparent",
        ]}
        style={styles.topLight}
      />

      {/* 🟦 GRID */}
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

      {/* 🔙 TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={goBack}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* 🎮 CONTENT */}
      <View style={styles.container}>
        <Text style={styles.title}>{game.toUpperCase()}</Text>

        <TouchableOpacity style={styles.btn} onPress={() => go("pvp")}>
          <Text style={styles.text}>👥 Player vs Player</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={() => go("ai")}>
          <Text style={styles.text}>🤖 Play with AI</Text>
        </TouchableOpacity>
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  center: {
    flex: 1,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 28,
    marginBottom: 30,
    fontWeight: "bold",
  },

  // 🔙 TOP BAR
  topBar: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },

  back: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  // 🔘 BUTTON
  btn: {
    width: "80%",
    padding: 18,
    backgroundColor: "#1e40af",
    marginVertical: 10,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },

  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  // 🌟 LIGHT
  topLight: {
    position: "absolute",
    top: -100,
    left: -100,
    right: -100,
    height: 300,
    borderRadius: 300,
    opacity: 0.7,
  },

  // 🟦 GRID
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
});