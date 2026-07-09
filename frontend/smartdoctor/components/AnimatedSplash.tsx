import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Image, Text, View } from "react-native";

const { width } = Dimensions.get("window");

interface AnimatedSplashProps {
  onFinished: () => void;
}

export default function AnimatedSplash({ onFinished }: AnimatedSplashProps) {
  // ── Animated values ───────────────────────────────────────────────────────
  const logoScale = useRef(new Animated.Value(0.35)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(12)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  const pulse1Scale = useRef(new Animated.Value(1)).current;
  const pulse1Opacity = useRef(new Animated.Value(0.5)).current;
  const pulse2Scale = useRef(new Animated.Value(1)).current;
  const pulse2Opacity = useRef(new Animated.Value(0.35)).current;

  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const makePulse = (
      scale: Animated.Value,
      opacity: Animated.Value,
      duration: number,
      toScale: number,
    ) =>
      Animated.loop(
        Animated.parallel([
          Animated.timing(scale, {
            toValue: toScale,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ]),
      );

    const pulse1 = makePulse(pulse1Scale, pulse1Opacity, 1600, 2.0);
    const pulse2 = makePulse(pulse2Scale, pulse2Opacity, 2200, 2.6);
    pulse1.start();
    setTimeout(() => pulse2.start(), 700);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 55,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      pulse1.stop();
      pulse2.stop();
      onFinished();
    });
  }, []);

  const RING = 140;

  return (
    <Animated.View
      className="absolute inset-0 bg-[#1565C0] items-center justify-center"
      style={{ opacity: screenOpacity, zIndex: 9999 }}
    >
      {/* Decorative blobs — dynamic sizes keep inline */}
      <View
        className="absolute rounded-full"
        style={{
          width: width * 0.85,
          height: width * 0.85,
          borderRadius: (width * 0.85) / 2,
          backgroundColor: "rgba(255,255,255,0.06)",
          top: -width * 0.35,
          right: -width * 0.3,
        }}
      />
      <View
        className="absolute rounded-full"
        style={{
          width: width * 0.7,
          height: width * 0.7,
          borderRadius: (width * 0.7) / 2,
          backgroundColor: "rgba(255,255,255,0.04)",
          bottom: -width * 0.25,
          left: -width * 0.25,
        }}
      />

      {/* Pulse rings */}
      <Animated.View
        className="absolute border border-white/40 rounded-full"
        style={{
          width: RING,
          height: RING,
          borderRadius: RING / 2,
          transform: [{ scale: pulse1Scale }],
          opacity: pulse1Opacity,
        }}
      />
      <Animated.View
        className="absolute border border-white/30 rounded-full"
        style={{
          width: RING,
          height: RING,
          borderRadius: RING / 2,
          transform: [{ scale: pulse2Scale }],
          opacity: pulse2Opacity,
        }}
      />

      {/* Logo */}
      <Animated.View
        className="mb-7"
        style={{
          transform: [{ scale: logoScale }],
          opacity: logoOpacity,
        }}
      >
        <Image
          source={require("../assets/images/splash-icon.png")}
          className="w-[110px] h-[110px]"
          resizeMode="contain"
        />
      </Animated.View>

      {/* App name */}
      <Animated.Text
        className="text-[34px] font-bold text-white text-center mb-2 tracking-wide"
        style={{
          opacity: titleOpacity,
          transform: [{ translateY: titleTranslateY }],
        }}
      >
        Smart Doctor
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text
        className="text-sm text-white/60 text-center uppercase tracking-[1.8px]"
        style={{ opacity: subtitleOpacity }}
      >
        Your Health, Our Priority
      </Animated.Text>

      {/* Footer */}
      <View className="absolute bottom-12">
        <Text className="text-[11px] text-white/30 tracking-[2.5px] font-semibold">
          POWERED BY AI
        </Text>
      </View>
    </Animated.View>
  );
}
