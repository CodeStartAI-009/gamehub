// app/store.jsx

import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  BackHandler,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { useGameStore } from "./store/useGameStore";
import { useBackgroundStore } from "./store/useBackgroundStore";
import { showRewardAd } from "./utils/ads";

export default function Store() {
  const router = useRouter();

  const coins = useGameStore((s) => s.coins);
  const spendCoins = useGameStore((s) => s.spendCoins);

  const {
    unlocked,
    selected,
    unlock,
    select,
    addAdProgress,
    adsProgress,
  } = useBackgroundStore();

  //
  // 🔙 BACK
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
  // 🎨 BACKGROUNDS
  //
  const backgrounds = [
    {
      id: "wood",
      name: "Wood",
      image: require("../assets/game/background/wood.png"),
      cost: 0,
      ads: 0,
    },
    {
      id: "dessert",
      name: "Dessert",
      image: require("../assets/game/background/dessert.png"),
      cost: 800,
      ads: 3,
    },
    {
      id: "fairy",
      name: "Fairy",
      image: require("../assets/game/background/fairy.png"),
      cost: 1000,
      ads: 4,
    },
    {
      id: "prack",
      name: "Prack",
      image: require("../assets/game/background/prack.png"),
      cost: 1200,
      ads: 4,
    },
    {
      id: "race",
      name: "Race",
      image: require("../assets/game/background/race.png"),
      cost: 1500,
      ads: 5,
    },
    {
      id: "ship",
      name: "Ship",
      image: require("../assets/game/background/ship.png"),
      cost: 1500,
      ads: 5,
    },
    {
      id: "snow",
      name: "Snow",
      image: require("../assets/game/background/snow.png"),
      cost: 1200,
      ads: 4,
    },
    {
      id: "space",
      name: "Space",
      image: require("../assets/game/background/space.png"),
      cost: 1800,
      ads: 6,
    },
    {
      id: "village",
      name: "Village",
      image: require("../assets/game/background/village.png"),
      cost: 1300,
      ads: 4,
    },
  ];

  //
  // 💰 BUY
  //
  const buy = (bg) => {
    if (bg.cost === 0) {
      unlock(bg.id);
      return;
    }

    if (coins >= bg.cost) {
      spendCoins(bg.cost);
      unlock(bg.id);
    }
  };

  //
  // 🎥 WATCH AD
  //
  const watchAd = async (bg) => {
    const ok = await showRewardAd();
    if (ok) addAdProgress(bg.id, bg.ads);
  };

  return (
    <View style={{ flex: 1 }}>
      
      {/* 🔵 BACKGROUND */}
      <LinearGradient
        colors={["#3b82f6", "#1e3a8a", "#020617"]}
        style={StyleSheet.absoluteFill}
      />

      {/* 🔙 TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={goBack}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.coins}>🪙 {coins}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Background Store</Text>

        {backgrounds.map((bg) => {
          const isUnlocked = unlocked[bg.id];
          const progress = adsProgress[bg.id] || 0;

          return (
            <View key={bg.id} style={styles.card}>
              <Image source={bg.image} style={styles.image} />

              <Text style={styles.name}>{bg.name}</Text>

              {isUnlocked ? (
                <TouchableOpacity
                  style={[
                    styles.btn,
                    selected === bg.id && styles.active,
                  ]}
                  onPress={() => select(bg.id)}
                >
                  <Text style={styles.text}>
                    {selected === bg.id ? "Selected" : "Use"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.btn}
                    onPress={() => buy(bg)}
                  >
                    <Text style={styles.text}>
                      Buy ({bg.cost})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btn}
                    onPress={() => watchAd(bg)}
                  >
                    <Text style={styles.text}>
                      Watch Ad ({progress}/{bg.ads})
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

//
// 🎨 STYLES
//
const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },

  topBar: {
    marginTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  back: {
    color: "#fff",
    fontSize: 18,
  },

  coins: {
    color: "#ffd700",
    fontWeight: "bold",
  },

  title: {
    color: "#fff",
    fontSize: 26,
    marginVertical: 20,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#1e40af",
    padding: 12,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: 140,
    borderRadius: 10,
  },

  name: {
    color: "#fff",
    marginVertical: 10,
    fontSize: 16,
  },

  btn: {
    backgroundColor: "#444",
    padding: 10,
    marginTop: 5,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },

  active: {
    backgroundColor: "#22c55e",
  },

  text: {
    color: "#fff",
  },
});