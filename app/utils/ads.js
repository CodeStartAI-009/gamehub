// utils/ads.js

import Constants from "expo-constants";

let RewardedAd, RewardedAdEventType, TestIds, mobileAds;

//
// 🚫 CHECK IF EXPO GO
//
const isExpoGo = Constants.appOwnership === "expo";

if (!isExpoGo) {
  const ads = require("react-native-google-mobile-ads");

  RewardedAd = ads.RewardedAd;
  RewardedAdEventType = ads.RewardedAdEventType;
  TestIds = ads.TestIds;
  mobileAds = ads.default;
} else {
  console.log("🚫 Reward ads disabled in Expo Go");
}

//
// 🎯 AD UNIT
//
const adUnitId =
  __DEV__ && TestIds
    ? TestIds.REWARDED
    : "ca-app-pub-8525673711213815/6333553878";

//
// 🎬 SHOW REWARD AD
//
export async function showRewardAd() {
  //
  // 🚫 FALLBACK FOR EXPO GO
  //
  if (isExpoGo || !RewardedAd) {
    console.log("⚠️ Using fake reward ad");
    return new Promise((resolve) =>
      setTimeout(() => resolve(true), 800)
    );
  }

  try {
    // 🔥 Initialize SDK (only once)
    await mobileAds().initialize();

    return new Promise((resolve) => {
      const rewarded = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      let earned = false;

      const unsubscribeLoaded = rewarded.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          rewarded.show();
        }
      );

      const unsubscribeEarned = rewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          earned = true;
        }
      );

      const unsubscribeClosed = rewarded.addAdEventListener(
        RewardedAdEventType.CLOSED,
        () => {
          cleanup();
          resolve(earned);
        }
      );

      const unsubscribeError = rewarded.addAdEventListener(
        RewardedAdEventType.ERROR,
        (e) => {
          console.log("Ad error:", e);
          cleanup();
          resolve(false);
        }
      );

      function cleanup() {
        unsubscribeLoaded();
        unsubscribeEarned();
        unsubscribeClosed();
        unsubscribeError();
      }

      rewarded.load();
    });
  } catch (e) {
    console.log("Ad init error:", e);
    return false;
  }
}