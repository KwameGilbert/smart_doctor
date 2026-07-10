import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Platform,
  ScrollView,
  FlatList,
  ScrollViewProps,
  FlatListProps,
} from "react-native";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useDerivedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
  cancelAnimation,
  SharedValue,
  useAnimatedProps,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

// Reanimated custom components
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList) as any;

// Constants
const REFRESH_HEIGHT = 75;
const THRESHOLD = 85;
const SVG_RADIUS = 14;
const SVG_CIRCUMFERENCE = 2 * Math.PI * SVG_RADIUS;

export interface PullToRefreshProps extends ScrollViewProps {
  refreshing: boolean;
  onRefresh: () => void | Promise<void>;
  children: React.ReactNode;
}

export interface PullToRefreshFlatListProps<T> extends FlatListProps<T> {
  refreshing: boolean;
  onRefresh: () => void | Promise<void>;
}

// Internal State Types
type PullState = "idle" | "pulling" | "ready" | "refreshing" | "success";

interface RefreshIndicatorProps {
  pullProgress: SharedValue<number>;
  state: PullState;
}

/**
 * Custom Refresh Indicator Header
 */
const RefreshHeader: React.FC<RefreshIndicatorProps> = ({ pullProgress, state }) => {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  // Handle continuous rotation during refreshing
  useEffect(() => {
    if (state === "refreshing") {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 500 }),
          withTiming(1.0, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(rotation);
      cancelAnimation(pulse);
      rotation.value = 0;
      pulse.value = 1;
    }
  }, [state]);

  // Indicator animated style
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: state === "refreshing" ? `${rotation.value}deg` : `${pullProgress.value * 360}deg` },
        { scale: state === "refreshing" ? pulse.value : 1 },
      ],
    };
  });

  // Circle progress animated props
  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = SVG_CIRCUMFERENCE - (Math.min(pullProgress.value, 1) * SVG_CIRCUMFERENCE);
    return {
      strokeDashoffset,
    };
  });

  // Get indicator text and colors based on state
  const getHeaderDetails = () => {
    switch (state) {
      case "pulling":
        return {
          text: "Pull down to refresh",
          icon: "medical-outline" as const,
          colorClass: "text-slate-500",
          strokeColor: "#1565C0", // Primary Medical Blue
        };
      case "ready":
        return {
          text: "Release to refresh",
          icon: "arrow-down-outline" as const,
          colorClass: "text-[#1565C0] font-medium",
          strokeColor: "#1565C0",
        };
      case "refreshing":
        return {
          text: "Checking symptoms & updates...",
          icon: "pulse" as const,
          colorClass: "text-[#1565C0] font-semibold",
          strokeColor: "#1565C0",
        };
      case "success":
        return {
          text: "Health records synchronized!",
          icon: "checkmark-circle-outline" as const,
          colorClass: "text-emerald-600 font-semibold",
          strokeColor: "#10B981", // Success Green
        };
      default:
        return {
          text: "Pull down to refresh",
          icon: "medical-outline" as const,
          colorClass: "text-slate-500",
          strokeColor: "#1565C0",
        };
    }
  };

  const details = getHeaderDetails();

  return (
    <View 
      className="w-full flex-row items-center justify-center py-4 bg-transparent"
      style={{ height: REFRESH_HEIGHT }}
    >
      <View className="flex-row items-center space-x-3">
        <Animated.View style={indicatorStyle} className="items-center justify-center w-9 h-9">
          {state === "success" ? (
            <Ionicons name="checkmark-circle" size={26} color="#10B981" />
          ) : (
            <View className="items-center justify-center">
              <Svg width={32} height={32} style={{ position: "absolute" }}>
                {/* Background circle track */}
                <Circle
                  cx={16}
                  cy={16}
                  r={SVG_RADIUS}
                  stroke="#E2E8F0"
                  strokeWidth={2}
                  fill="transparent"
                />
                {/* Animated active progress circle */}
                <AnimatedCircle
                  cx={16}
                  cy={16}
                  r={SVG_RADIUS}
                  stroke={details.strokeColor}
                  strokeWidth={2.5}
                  fill="transparent"
                  strokeDasharray={`${SVG_CIRCUMFERENCE} ${SVG_CIRCUMFERENCE}`}
                  animatedProps={animatedCircleProps}
                  strokeLinecap="round"
                />
              </Svg>
              <Ionicons 
                name={details.icon} 
                size={16} 
                color={details.strokeColor} 
                style={{ marginTop: 0.5 }}
              />
            </View>
          )}
        </Animated.View>
        <Text className={`text-sm ml-2 ${details.colorClass}`}>{details.text}</Text>
      </View>
    </View>
  );
};

/**
 * Drop-in Pull To Refresh ScrollView Component
 */
export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  refreshing,
  onRefresh,
  children,
  className = "",
  contentContainerStyle,
  ...restProps
}) => {
  const [internalState, setInternalState] = useState<PullState>("idle");
  const prevRefreshing = useRef(refreshing);

  // Shared values
  const scrollY = useSharedValue(0);
  const translationY = useSharedValue(0);
  const hapticTriggered = useSharedValue(false);

  // Derived pulling progress (0 to 1+)
  const pullProgress = useDerivedValue(() => {
    if (Platform.OS === "ios") {
      return Math.min(Math.max(0, -scrollY.value) / THRESHOLD, 2);
    } else {
      return Math.min(translationY.value / THRESHOLD, 2);
    }
  });

  // Handle parent refreshing state changes
  useEffect(() => {
    if (prevRefreshing.current && !refreshing) {
      // Transition from refreshing -> idle: show success checkmark first
      setInternalState("success");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Keep success message visible for 800ms, then collapse
      setTimeout(() => {
        translationY.value = withSpring(0, { damping: 15, stiffness: 100 }, (finished) => {
          if (finished) {
            runOnJS(setInternalState)("idle");
            runOnJS(runOnJSResetHaptic)();
          }
        });
      }, 800);
    } else if (!prevRefreshing.current && refreshing) {
      // Direct update of refreshing state by parent
      setInternalState("refreshing");
      translationY.value = withSpring(REFRESH_HEIGHT, { damping: 15, stiffness: 100 });
    }
    prevRefreshing.current = refreshing;
  }, [refreshing]);

  const runOnJSResetHaptic = () => {
    hapticTriggered.value = false;
  };

  // Safe triggering of refresh and haptic
  const triggerRefresh = () => {
    setInternalState("refreshing");
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onRefresh();
  };

  const triggerHapticFeedback = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Gesture definition (Android Pulling)
  const panGesture = Gesture.Pan()
    .activeOffsetY([0, 10])
    .failOffsetY([-10, 0])
    .onUpdate((event) => {
      // Android does not overscroll. We intercept if scrollY <= 0.
      if (Platform.OS === "android" && scrollY.value <= 0 && event.translationY > 0 && internalState !== "refreshing" && internalState !== "success") {
        // Apply resistance formula
        const rawY = event.translationY;
        const dragResistance = Math.pow(rawY, 0.82) * 1.8;
        translationY.value = dragResistance;

        if (dragResistance > THRESHOLD) {
          if (!hapticTriggered.value) {
            hapticTriggered.value = true;
            runOnJS(triggerHapticFeedback)();
          }
          runOnJS(setInternalState)("ready");
        } else {
          hapticTriggered.value = false;
          runOnJS(setInternalState)("pulling");
        }
      }
    })
    .onEnd(() => {
      if (Platform.OS === "android" && translationY.value > 0) {
        if (translationY.value >= THRESHOLD) {
          translationY.value = withSpring(REFRESH_HEIGHT, { damping: 15 });
          runOnJS(triggerRefresh)();
        } else {
          translationY.value = withSpring(0, { damping: 15 });
          runOnJS(setInternalState)("idle");
        }
      }
    });

  // Animated Styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    if (Platform.OS === "ios") {
      // iOS overscroll naturally drives translation
      const pullingOffset = -scrollY.value;
      const translateY = pullingOffset > 0 ? pullingOffset - REFRESH_HEIGHT : -REFRESH_HEIGHT;
      
      // Update state and haptics on iOS
      if (pullingOffset > 0 && internalState !== "refreshing" && internalState !== "success") {
        if (pullingOffset >= THRESHOLD) {
          if (!hapticTriggered.value) {
            hapticTriggered.value = true;
            runOnJS(triggerHapticFeedback)();
            runOnJS(setInternalState)("ready");
          }
        } else {
          hapticTriggered.value = false;
          runOnJS(setInternalState)("pulling");
        }
      }

      return {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        transform: [{ translateY }],
        opacity: pullingOffset > 0 ? 1 : 0,
      };
    } else {
      // Android gesture-driven position
      return {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        transform: [{ translateY: translationY.value - REFRESH_HEIGHT }],
        opacity: translationY.value > 0 ? 1 : 0,
      };
    }
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    if (Platform.OS === "android") {
      return {
        transform: [{ translateY: translationY.value }],
      };
    }
    return {};
  });

  // IOS Scroll Handlers
  const iosScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
    onEndDrag: (event) => {
      if (Platform.OS === "ios") {
        const pullingOffset = -event.contentOffset.y;
        if (pullingOffset >= THRESHOLD && internalState !== "refreshing" && internalState !== "success") {
          runOnJS(triggerRefresh)();
        }
      }
    },
  });

  const androidScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Render Android (Gesture-driven wrapper)
  if (Platform.OS === "android") {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GestureDetector gesture={panGesture}>
          <View className="flex-1 overflow-hidden">
            <Animated.View style={headerAnimatedStyle} className="z-50">
              <RefreshHeader pullProgress={pullProgress} state={internalState} />
            </Animated.View>
            <Animated.View style={[{ flex: 1 }, contentAnimatedStyle]}>
              <AnimatedScrollView
                {...restProps}
                onScroll={androidScrollHandler}
                scrollEventThrottle={16}
                className={className}
                contentContainerStyle={contentContainerStyle}
              >
                {children}
              </AnimatedScrollView>
            </Animated.View>
          </View>
        </GestureDetector>
      </GestureHandlerRootView>
    );
  }

  // Render iOS (Native overscroll ScrollView)
  return (
    <View className="flex-1">
      <Animated.View style={headerAnimatedStyle} className="z-50">
        <RefreshHeader pullProgress={pullProgress} state={internalState} />
      </Animated.View>
      <AnimatedScrollView
        {...restProps}
        onScroll={iosScrollHandler}
        scrollEventThrottle={16}
        className={className}
        contentContainerStyle={contentContainerStyle}
        // Native contentInset holds scrollview open during refreshing
        contentInset={{ top: refreshing ? REFRESH_HEIGHT : 0 }}
        contentOffset={refreshing && scrollY.value === 0 ? { x: 0, y: -REFRESH_HEIGHT } : undefined}
      >
        {children}
      </AnimatedScrollView>
    </View>
  );
};

/**
 * Drop-in Pull To Refresh FlatList Component
 */
export function PullToRefreshFlatList<T>({
  refreshing,
  onRefresh,
  className = "",
  contentContainerStyle,
  ...restProps
}: PullToRefreshFlatListProps<T>) {
  const [internalState, setInternalState] = useState<PullState>("idle");
  const prevRefreshing = useRef(refreshing);

  // Shared values
  const scrollY = useSharedValue(0);
  const translationY = useSharedValue(0);
  const hapticTriggered = useSharedValue(false);

  // Derived pulling progress (0 to 1+)
  const pullProgress = useDerivedValue(() => {
    if (Platform.OS === "ios") {
      return Math.min(Math.max(0, -scrollY.value) / THRESHOLD, 2);
    } else {
      return Math.min(translationY.value / THRESHOLD, 2);
    }
  });

  // Handle parent refreshing state changes
  useEffect(() => {
    if (prevRefreshing.current && !refreshing) {
      setInternalState("success");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setTimeout(() => {
        translationY.value = withSpring(0, { damping: 15, stiffness: 100 }, (finished) => {
          if (finished) {
            runOnJS(setInternalState)("idle");
            runOnJS(runOnJSResetHaptic)();
          }
        });
      }, 800);
    } else if (!prevRefreshing.current && refreshing) {
      setInternalState("refreshing");
      translationY.value = withSpring(REFRESH_HEIGHT, { damping: 15, stiffness: 100 });
    }
    prevRefreshing.current = refreshing;
  }, [refreshing]);

  const runOnJSResetHaptic = () => {
    hapticTriggered.value = false;
  };

  const triggerRefresh = () => {
    setInternalState("refreshing");
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onRefresh();
  };

  const triggerHapticFeedback = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Gesture definition (Android Pulling)
  const panGesture = Gesture.Pan()
    .activeOffsetY([0, 10])
    .failOffsetY([-10, 0])
    .onUpdate((event) => {
      if (Platform.OS === "android" && scrollY.value <= 0 && event.translationY > 0 && internalState !== "refreshing" && internalState !== "success") {
        const rawY = event.translationY;
        const dragResistance = Math.pow(rawY, 0.82) * 1.8;
        translationY.value = dragResistance;

        if (dragResistance > THRESHOLD) {
          if (!hapticTriggered.value) {
            hapticTriggered.value = true;
            runOnJS(triggerHapticFeedback)();
          }
          runOnJS(setInternalState)("ready");
        } else {
          hapticTriggered.value = false;
          runOnJS(setInternalState)("pulling");
        }
      }
    })
    .onEnd(() => {
      if (Platform.OS === "android" && translationY.value > 0) {
        if (translationY.value >= THRESHOLD) {
          translationY.value = withSpring(REFRESH_HEIGHT, { damping: 15 });
          runOnJS(triggerRefresh)();
        } else {
          translationY.value = withSpring(0, { damping: 15 });
          runOnJS(setInternalState)("idle");
        }
      }
    });

  // Animated Styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    if (Platform.OS === "ios") {
      const pullingOffset = -scrollY.value;
      const translateY = pullingOffset > 0 ? pullingOffset - REFRESH_HEIGHT : -REFRESH_HEIGHT;
      
      if (pullingOffset > 0 && internalState !== "refreshing" && internalState !== "success") {
        if (pullingOffset >= THRESHOLD) {
          if (!hapticTriggered.value) {
            hapticTriggered.value = true;
            runOnJS(triggerHapticFeedback)();
            runOnJS(setInternalState)("ready");
          }
        } else {
          hapticTriggered.value = false;
          runOnJS(setInternalState)("pulling");
        }
      }

      return {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        transform: [{ translateY }],
        opacity: pullingOffset > 0 ? 1 : 0,
      };
    } else {
      return {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        transform: [{ translateY: translationY.value - REFRESH_HEIGHT }],
        opacity: translationY.value > 0 ? 1 : 0,
      };
    }
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    if (Platform.OS === "android") {
      return {
        transform: [{ translateY: translationY.value }],
      };
    }
    return {};
  });

  // IOS Scroll Handlers
  const iosScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
    onEndDrag: (event) => {
      if (Platform.OS === "ios") {
        const pullingOffset = -event.contentOffset.y;
        if (pullingOffset >= THRESHOLD && internalState !== "refreshing" && internalState !== "success") {
          runOnJS(triggerRefresh)();
        }
      }
    },
  });

  const androidScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Render Android (Gesture-driven wrapper)
  if (Platform.OS === "android") {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GestureDetector gesture={panGesture}>
          <View className="flex-1 overflow-hidden">
            <Animated.View style={headerAnimatedStyle} className="z-50">
              <RefreshHeader pullProgress={pullProgress} state={internalState} />
            </Animated.View>
            <Animated.View style={[{ flex: 1 }, contentAnimatedStyle]}>
              <AnimatedFlatList
                {...restProps}
                onScroll={androidScrollHandler}
                scrollEventThrottle={16}
                className={className}
                contentContainerStyle={contentContainerStyle}
              />
            </Animated.View>
          </View>
        </GestureDetector>
      </GestureHandlerRootView>
    );
  }

  // Render iOS (Native overscroll FlatList)
  return (
    <View className="flex-1">
      <Animated.View style={headerAnimatedStyle} className="z-50">
        <RefreshHeader pullProgress={pullProgress} state={internalState} />
      </Animated.View>
      <AnimatedFlatList
        {...restProps}
        onScroll={iosScrollHandler}
        scrollEventThrottle={16}
        className={className}
        contentContainerStyle={contentContainerStyle}
        contentInset={{ top: refreshing ? REFRESH_HEIGHT : 0 }}
        contentOffset={refreshing && scrollY.value === 0 ? { x: 0, y: -REFRESH_HEIGHT } : undefined}
      />
    </View>
  );
}

export interface PullToRefreshViewProps {
  refreshing: boolean;
  onRefresh: () => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
  style?: any;
  enabled?: boolean;
}

/**
 * Generic gesture-based Pull To Refresh Wrapper (ScrollView-independent)
 */
export const PullToRefreshView: React.FC<PullToRefreshViewProps> = ({
  refreshing,
  onRefresh,
  children,
  className = "",
  style,
  enabled = true,
}) => {
  const [internalState, setInternalState] = useState<PullState>("idle");
  const prevRefreshing = useRef(refreshing);

  // Shared values
  const translationY = useSharedValue(0);
  const hapticTriggered = useSharedValue(false);

  // Derived pulling progress (0 to 1+)
  const pullProgress = useDerivedValue(() => {
    return Math.min(translationY.value / THRESHOLD, 2);
  });

  // Handle parent refreshing state changes
  useEffect(() => {
    if (prevRefreshing.current && !refreshing) {
      setInternalState("success");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setTimeout(() => {
        translationY.value = withSpring(0, { damping: 15, stiffness: 100 }, (finished) => {
          if (finished) {
            runOnJS(setInternalState)("idle");
            runOnJS(runOnJSResetHaptic)();
          }
        });
      }, 800);
    } else if (!prevRefreshing.current && refreshing) {
      setInternalState("refreshing");
      translationY.value = withSpring(REFRESH_HEIGHT, { damping: 15, stiffness: 100 });
    }
    prevRefreshing.current = refreshing;
  }, [refreshing]);

  const runOnJSResetHaptic = () => {
    hapticTriggered.value = false;
  };

  const triggerRefresh = () => {
    setInternalState("refreshing");
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onRefresh();
  };

  const triggerHapticFeedback = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Gesture definition (works on both iOS and Android)
  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetY([0, 10])
    .failOffsetY([-10, 0])
    .onUpdate((event) => {
      if (event.translationY > 0 && internalState !== "refreshing" && internalState !== "success") {
        const rawY = event.translationY;
        const dragResistance = Math.pow(rawY, 0.82) * 1.8;
        translationY.value = dragResistance;

        if (dragResistance > THRESHOLD) {
          if (!hapticTriggered.value) {
            hapticTriggered.value = true;
            runOnJS(triggerHapticFeedback)();
          }
          runOnJS(setInternalState)("ready");
        } else {
          hapticTriggered.value = false;
          runOnJS(setInternalState)("pulling");
        }
      }
    })
    .onEnd(() => {
      if (translationY.value > 0) {
        if (translationY.value >= THRESHOLD) {
          translationY.value = withSpring(REFRESH_HEIGHT, { damping: 15 });
          runOnJS(triggerRefresh)();
        } else {
          translationY.value = withSpring(0, { damping: 15 });
          runOnJS(setInternalState)("idle");
        }
      }
    });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      transform: [{ translateY: translationY.value - REFRESH_HEIGHT }],
      opacity: translationY.value > 0 ? 1 : 0,
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translationY.value }],
    };
  });

  return (
    <GestureHandlerRootView style={style}>
      <GestureDetector gesture={panGesture}>
        <View className={`overflow-hidden ${className}`}>
          <Animated.View style={headerAnimatedStyle} className="z-50">
            <RefreshHeader pullProgress={pullProgress} state={internalState} />
          </Animated.View>
          <Animated.View style={contentAnimatedStyle}>
            {children}
          </Animated.View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

