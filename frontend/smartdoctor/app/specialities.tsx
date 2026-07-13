import React, { useState, useEffect } from "react";
import { useColorScheme } from "nativewind";
import { View, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { specialtyApi } from "../services/api/specialty";

interface SpecialtyItem {
  id: string;
  name: string;
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
}

const getSpecialtyUiProperties = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes("cardi")) {
    return { icon: "heart" as const, color: "#EF4444", bg: "#FEF2F2" };
  }
  if (normalized.includes("pedia")) {
    return { icon: "body" as const, color: "#3B82F6", bg: "#EFF6FF" };
  }
  if (normalized.includes("derm")) {
    return { icon: "sparkles" as const, color: "#10B981", bg: "#ECFDF5" };
  }
  if (normalized.includes("neur")) {
    return { icon: "pulse" as const, color: "#8B5CF6", bg: "#F5F3FF" };
  }
  if (normalized.includes("orth")) {
    return { icon: "fitness" as const, color: "#F59E0B", bg: "#FFFBEB" };
  }
  if (normalized.includes("ophth")) {
    return { icon: "eye" as const, color: "#EC4899", bg: "#FDF2F8" };
  }
  if (normalized.includes("dent") || normalized.includes("tooth")) {
    return { icon: "medical" as const, color: "#06B6D4", bg: "#ECFEFF" };
  }
  if (normalized.includes("psych") || normalized.includes("mental")) {
    return { icon: "chatbubbles" as const, color: "#6366F1", bg: "#EEF2FF" };
  }
  if (normalized.includes("gastro") || normalized.includes("stomach")) {
    return { icon: "flask" as const, color: "#14B8A6", bg: "#F0FDF4" };
  }
  if (normalized.includes("onc")) {
    return { icon: "ribbon" as const, color: "#F43F5E", bg: "#FFF1F2" };
  }
  if (normalized.includes("radi")) {
    return { icon: "aperture" as const, color: "#64748B", bg: "#F8FAFC" };
  }
  return { icon: "medkit" as const, color: "#0EA5E9", bg: "#F0F9FF" };
};

export default function SpecialitiesScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [search, setSearch] = useState("");
  const [specialties, setSpecialties] = useState<SpecialtyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await specialtyApi.list();
        if (response.status === "success") {
          const items = response.data.map((item) => {
            const visuals = getSpecialtyUiProperties(item.name);
            return {
              id: item.id,
              name: item.name,
              description: item.description,
              icon: (item.icon || visuals.icon) as keyof typeof Ionicons.glyphMap,
              color: item.color || visuals.color,
              bg: item.bg || visuals.bg,
            };
          });
          setSpecialties(items);
        }
      } catch (error) {
        console.error("Failed to fetch specialties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  const filteredSpecialties = specialties.filter((spec) =>
    spec.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-surface dark:bg-surface-dark border-b border-border-color dark:border-border-color-dark">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark mr-3"
        >
          <Ionicons name="chevron-back" size={22} color={isDark ? "#F8FAFC" : "#1E293B"} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-main dark:text-text-main-dark">All Specialities</Text>
      </View>

      {/* Search Input */}
      <View className="px-6 py-4 bg-surface dark:bg-surface-dark border-b border-border-color dark:border-border-color-dark">
        <View className="flex-row items-center bg-background dark:bg-background-dark px-4 py-3 rounded-2xl border border-border-color dark:border-border-color-dark shadow-sm">
          <Ionicons name="search-outline" size={20} color={isDark ? "#64748B" : "#94A3B8"} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search specialities..."
            placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
            value={search}
            onChangeText={setSearch}
            className="flex-1 text-text-main dark:text-text-main-dark text-sm font-medium"
            style={{ padding: 0 }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={isDark ? "#64748B" : "#94A3B8"} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Grid List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={isDark ? "#60A5FA" : "#1565C0"} />
        </View>
      ) : filteredSpecialties.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 bg-surface dark:bg-surface-dark rounded-2xl items-center justify-center mb-4 shadow-sm border border-border-color dark:border-border-color-dark">
            <Ionicons name="alert-circle-outline" size={32} color={isDark ? "#64748B" : "#94A3B8"} />
          </View>
          <Text className="text-lg font-bold text-text-main dark:text-text-main-dark text-center mb-1">
            No Specialities Found
          </Text>
          <Text className="text-sm text-text-muted dark:text-text-muted-dark text-center">
            {"We couldn't find matches for \"" + search + "\". Try another term."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSpecialties}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 16 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push({ pathname: "/(tabs)/doctors", params: { specialty: item.name } })}
              className="bg-surface dark:bg-surface-dark p-5 rounded-3xl border border-border-color dark:border-border-color-dark shadow-sm items-center mb-4"
              style={{ width: "48%" }}
            >
              <View
                style={{ backgroundColor: isDark ? (item.color + "1A") : item.bg }}
                className="w-14 h-14 rounded-2xl items-center justify-center mb-3 shadow-sm"
              >
                <Ionicons name={item.icon} size={26} color={item.color} />
              </View>
              <Text className="text-sm font-bold text-text-main dark:text-text-main-dark text-center mb-1" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-xs text-primary font-bold text-center">
                Consult Now
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
