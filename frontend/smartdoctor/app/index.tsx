import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Animated,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "AI Symptom Checker",
    description:
      "Describe your symptoms and our AI will provide instant, reliable health insights.",
    icon: "medical-outline" as const,
  },
  {
    id: "2",
    title: "Book Appointments",
    description:
      "Easily schedule visits with top-rated doctors in your area with just a few taps.",
    icon: "calendar-outline" as const,
  },
  {
    id: "3",
    title: "Secure Health Records",
    description:
      "Keep all your medical history and prescriptions safe and accessible anytime.",
    icon: "lock-closed-outline" as const,
  },
];

export default function OnboardingScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace("/auth");
    }
  };

  const skipOnboarding = () => {
    router.replace("/auth");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Bar */}
      <View className="flex-row justify-end px-6 pt-2">
        <TouchableOpacity onPress={skipOnboarding} className="p-2">
          <Text className="text-[#1565C0] font-semibold text-base">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <View className="flex-[3]">
        <Animated.FlatList
          data={SLIDES}
          renderItem={({ item }) => (
            <View className="items-center justify-center px-8" style={{ width }}>
              <View className="w-48 h-48 bg-[#E6F4FE] rounded-full items-center justify-center mb-10">
                <Ionicons name={item.icon} size={100} color="#1565C0" />
              </View>
              <Text className="text-3xl font-bold text-slate-900 text-center mb-4">
                {item.title}
              </Text>
              <Text className="text-base text-slate-500 text-center leading-relaxed px-4">
                {item.description}
              </Text>
            </View>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          scrollEventThrottle={32}
          ref={slidesRef}
        />
      </View>

      {/* Footer */}
      <View className="flex-1 justify-between px-8 pb-8 pt-4">
        {/* Pagination */}
        <View className="flex-row justify-center items-center h-8">
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: "clamp",
            });

            const dotColor = scrollX.interpolate({
              inputRange,
              outputRange: ["#E2E8F0", "#1565C0", "#E2E8F0"],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={i.toString()}
                style={{
                  width: dotWidth,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: dotColor,
                  marginHorizontal: 4,
                }}
              />
            );
          })}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={scrollToNext}
          className="bg-[#1565C0] py-4 rounded-2xl shadow-sm items-center justify-center"
        >
          <Text className="text-white font-bold text-lg">
            {currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
