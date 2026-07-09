import React, { useRef, useEffect } from "react";
import { View, Animated, StyleSheet, Dimensions, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";

interface GridSquare {
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  iconColor: string;
}

const SQUARE_ITEMS: GridSquare[] = [
  { icon: "medical", bg: "#E6F4FE", iconColor: "#1565C0" },
  { icon: "heart", bg: "#F0FDFA", iconColor: "#0D9488" },
  { icon: "calendar", bg: "#EEF2FF", iconColor: "#4F46E5" },
  { icon: "chatbubble-ellipses", bg: "#ECFEFF", iconColor: "#0891B2" },
  { icon: "shield-checkmark", bg: "#EFF6FF", iconColor: "#2563EB" },
  { icon: "document-text", bg: "#F0F9FF", iconColor: "#0284C7" },
  { icon: "fitness", bg: "#F5F3FF", iconColor: "#7C3AED" },
  { icon: "pulse", bg: "#F9F5FF", iconColor: "#9333EA" },
];

const { width } = Dimensions.get("window");
const gap = 12;
const colWidth = (width - gap * 5) / 4;
const itemHeight = colWidth + gap;
const uniqueHeight = itemHeight * 8; // 8 unique items in the cycle

// Duplicate 4 times to render 32 items. This provides ~2500px height.
// This is way longer than any screen height + translation distance, ensuring infinite cover.
const COL_0_ITEMS = [...SQUARE_ITEMS, ...SQUARE_ITEMS, ...SQUARE_ITEMS, ...SQUARE_ITEMS];
const COL_1_ITEMS = [[...SQUARE_ITEMS].reverse(), [...SQUARE_ITEMS].reverse(), [...SQUARE_ITEMS].reverse(), [...SQUARE_ITEMS].reverse()].flat();
const COL_2_ITEMS = [
  [...SQUARE_ITEMS].slice(3).concat([...SQUARE_ITEMS].slice(0, 3)),
  [...SQUARE_ITEMS].slice(3).concat([...SQUARE_ITEMS].slice(0, 3)),
  [...SQUARE_ITEMS].slice(3).concat([...SQUARE_ITEMS].slice(0, 3)),
  [...SQUARE_ITEMS].slice(3).concat([...SQUARE_ITEMS].slice(0, 3)),
].flat();
const COL_3_ITEMS = [
  [...SQUARE_ITEMS].slice(5).concat([...SQUARE_ITEMS].slice(0, 5)),
  [...SQUARE_ITEMS].slice(5).concat([...SQUARE_ITEMS].slice(0, 5)),
  [...SQUARE_ITEMS].slice(5).concat([...SQUARE_ITEMS].slice(0, 5)),
  [...SQUARE_ITEMS].slice(5).concat([...SQUARE_ITEMS].slice(0, 5)),
].flat();

export default function AuthGridBackground() {
  const scrollAnim0 = useRef(new Animated.Value(0)).current;
  const scrollAnim1 = useRef(new Animated.Value(-uniqueHeight)).current;
  const scrollAnim2 = useRef(new Animated.Value(0)).current;
  const scrollAnim3 = useRef(new Animated.Value(-uniqueHeight)).current;

  useEffect(() => {
    const createScrollAnimation = (
      anim: Animated.Value,
      fromVal: number,
      toVal: number,
      duration: number
    ) => {
      anim.setValue(fromVal);
      return Animated.loop(
        Animated.timing(anim, {
          toValue: toVal,
          duration: duration,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      );
    };

    const anim0 = createScrollAnimation(scrollAnim0, 0, -uniqueHeight, 24000);
    const anim1 = createScrollAnimation(scrollAnim1, -uniqueHeight, 0, 26000);
    const anim2 = createScrollAnimation(scrollAnim2, 0, -uniqueHeight, 28000);
    const anim3 = createScrollAnimation(scrollAnim3, -uniqueHeight, 0, 25000);

    anim0.start();
    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim0.stop();
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [scrollAnim0, scrollAnim1, scrollAnim2, scrollAnim3]);

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* Background Scrolling Grid */}
      <View style={styles.gridContainer} pointerEvents="none">
        {/* Column 0 */}
        <Animated.View
          style={[styles.column, { transform: [{ translateY: scrollAnim0 }] }]}
        >
          {COL_0_ITEMS.map((item, idx) => (
            <View
              key={`col0-${idx}`}
              style={[styles.square, { backgroundColor: item.bg }]}
            >
              <Ionicons name={item.icon} size={26} color={item.iconColor} />
            </View>
          ))}
        </Animated.View>

        {/* Column 1 */}
        <Animated.View
          style={[styles.column, { transform: [{ translateY: scrollAnim1 }] }]}
        >
          {COL_1_ITEMS.map((item, idx) => (
            <View
              key={`col1-${idx}`}
              style={[styles.square, { backgroundColor: item.bg }]}
            >
              <Ionicons name={item.icon} size={26} color={item.iconColor} />
            </View>
          ))}
        </Animated.View>

        {/* Column 2 */}
        <Animated.View
          style={[styles.column, { transform: [{ translateY: scrollAnim2 }] }]}
        >
          {COL_2_ITEMS.map((item, idx) => (
            <View
              key={`col2-${idx}`}
              style={[styles.square, { backgroundColor: item.bg }]}
            >
              <Ionicons name={item.icon} size={26} color={item.iconColor} />
            </View>
          ))}
        </Animated.View>

        {/* Column 3 */}
        <Animated.View
          style={[styles.column, { transform: [{ translateY: scrollAnim3 }] }]}
        >
          {COL_3_ITEMS.map((item, idx) => (
            <View
              key={`col3-${idx}`}
              style={[styles.square, { backgroundColor: item.bg }]}
            >
              <Ionicons name={item.icon} size={26} color={item.iconColor} />
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Svg Gradient Overlay for cylindrical rolling loop effect */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Svg height="100%" width="100%">
          <Defs>
            <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
              {/* Fade out/hide completely at the top */}
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <Stop offset="12%" stopColor="#ffffff" stopOpacity="0.45" />
              
              {/* Visible in the middle */}
              <Stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
              
              {/* Fade out/hide completely at the bottom */}
              <Stop offset="82%" stopColor="#ffffff" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bgGrad)" />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: gap,
    opacity: 0.35,
    overflow: "hidden",
  },
  column: {
    width: colWidth,
  },
  square: {
    height: colWidth,
    width: colWidth,
    marginBottom: gap,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
