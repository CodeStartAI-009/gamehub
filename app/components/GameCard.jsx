// app/components/GameCard.jsx

import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

// frontend/app/components/GameCard.jsx
export default function GameCard({ title, subtitle, onPress }) {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.play}>▶</Text>
      </TouchableOpacity>
    );
  }

const styles = StyleSheet.create({
  card: {
    width: "90%",
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: "#fff",
    fontSize: 18,
  },
  subtitle :{
    color: "#fff",
    fontSize: 18,
  },
  play: {
    color: "#fff",
    fontSize: 18,
  },
});