// app/_layout.jsx

import React, { useEffect } from "react";
import { View, StyleSheet, BackHandler } from "react-native";
import { Stack, useRouter } from "expo-router";
import Constants from "expo-constants";

//
// 🔥 DETECT ENVIRONMENT
//
const isExpoGo = Constants.appOwnership === "expo";

//
// 🔥 SAFE ADS IMPORT (NO TYPES IN JSX)
//
let BannerAd = null;
let BannerAdSize = null;
let TestIds = null;

if (!isExpoGo) {
  try {
    const ads = require("react-native-google-mobile-ads");
    BannerAd = ads.BannerAd;
    BannerAdSize = ads.BannerAdSize;
    TestIds = ads.TestIds;
  } catch (e) {
    console.log("Ads module failed to load:", e);
  }
} else {
  console.log("🚫 Ads disabled in Expo Go");
}

//
// 🎯 AD UNIT ID
//
const adUnitId =
  __DEV__ && TestIds
    ? TestIds.BANNER
    : "ca-app-pub-8525673711213815/4022251150";

export default function RootLayout() {
  const router = useRouter();

  //
  // 🔙 ANDROID BACK HANDLER
  //
  useEffect(() => {
    const backAction = () => {
      if (router.canGoBack()) {
        router.back();
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => sub.remove();
  }, []);

  return (
    <View style={styles.container}>
      
      {/* 🎮 STACK */}
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>

      {/* 📢 BANNER */}
      {!isExpoGo && BannerAd && BannerAdSize && (
        <View style={styles.banner}>
          <BannerAd
            unitId={adUnitId}
            size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>
      )}
    </View>
  );
}

//
// 🎨 STYLES
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  content: {
    flex: 1,
    paddingBottom: 60, // space for banner
  },

  banner: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    paddingVertical: 4,
  },
});