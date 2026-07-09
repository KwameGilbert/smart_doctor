// // Polyfill DOMException for packages that reference it on native
// if (typeof global.DOMException === "undefined") {
//   global.DOMException = class DOMException extends Error {
//     constructor(message?: string, name?: string) {
//       super(message);
//       this.name = name || "DOMException";
//     }
//   } as any;
// }

import "./global.css";

import { useEffect, useState } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import AnimatedSplash from "../components/AnimatedSplash";

// Prevent the native OS splash from auto-hiding before we're ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // 👉 Load fonts, async storage, feature flags, etc. here
        // Example: await Font.loadAsync({ ... });
      } catch (error) {
        console.warn("Splash prepare error:", error);
      } finally {
        // Mark app as ready — this triggers the layout to render, then we
        // hide the native splash and hand off to our animated splash.
        setAppReady(true);
      }
    }

    prepare();
  }, []);

  // Once the root view has painted, hide the native OS splash and start ours
  async function onRootViewLayout() {
    if (!appReady) return;
    await SplashScreen.hideAsync();
    setShowAnimatedSplash(true);
  }

  if (!appReady) {
    return null; // Keep the native splash visible while we're preparing
  }

  return (
    <View style={{ flex: 1 }} onLayout={onRootViewLayout}>
      <Stack screenOptions={{ headerShown: false }} />

      {showAnimatedSplash && (
        <AnimatedSplash onFinished={() => setShowAnimatedSplash(false)} />
      )}
    </View>
  );
}
