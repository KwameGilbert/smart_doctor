import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StyleSheet,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image } from "expo-image";
import SearchDiscover from "../../components/SearchDiscover";
import { PullToRefresh } from "../../components/ui/PullToRefresh";
import Animated, { FadeInUp, FadeOutUp, FadeInLeft, FadeOutLeft, Layout } from "react-native-reanimated";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HEALTH_PHRASES = [
  "How are you feeling today?",
  "How's your health today?",
  "Ready for your daily check-in?",
  "Hope you are feeling well!",
  "Let's track your wellness today.",
  "Ready to consult our AI?",
];

import { TOP_DOCTORS, OTHER_DOCTORS, SPECIALTIES } from "../../constants/data";

export default function HomeScreen() {
  const [phrase, setPhrase] = React.useState("");
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [refreshing, setRefreshing] = React.useState(false);
  const inputRef = React.useRef<TextInput>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API request to refresh dashboard information
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Select a new random health greeting phrase
    const randomPhrase = HEALTH_PHRASES[Math.floor(Math.random() * HEALTH_PHRASES.length)];
    setPhrase(randomPhrase);
    setRefreshing(false);
  };

  React.useEffect(() => {
    const randomPhrase = HEALTH_PHRASES[Math.floor(Math.random() * HEALTH_PHRASES.length)];
    setPhrase(randomPhrase);
  }, []);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleCancelSearch = () => {
    setIsSearchFocused(false);
    setSearchQuery("");
    Keyboard.dismiss();
  };

  const handleSelectQuery = (query: string) => {
    LayoutAnimation.configureNext({
      duration: 150,
      create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      update: { type: LayoutAnimation.Types.easeInEaseOut }
    });
    setSearchQuery(query);
    Keyboard.dismiss();
  };

  // Combine lists to filter results
  const allDoctors = [...TOP_DOCTORS, ...OTHER_DOCTORS];
  const searchResults = allDoctors.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <PullToRefresh
          refreshing={refreshing}
          onRefresh={handleRefresh}
          className="flex-1 px-6 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* User Header (Hidden when search has focus) */}
          {!isSearchFocused && (
            <Animated.View
              entering={FadeInUp.duration(160)}
              exiting={FadeOutUp.duration(160)}
              className="flex-row justify-between items-center mb-8"
            >
              <View className="flex-row items-center flex-1 pr-2">
                <Image
                  source={{ uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150" }}
                  style={{ width: 46, height: 46, borderRadius: 23, marginRight: 12 }}
                  className="border-2 border-white shadow-sm"
                />
                <View className="flex-1">
                  <Text className="text-xl font-bold text-slate-900" numberOfLines={1}>
                    Hello Elton,
                  </Text>
                  <Text className="text-slate-500 text-xs font-medium mt-0.5" numberOfLines={1}>
                    {phrase || "How are you feeling today?"}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => router.push("/doctor-chats")}
                  className="p-2 relative mr-0.5"
                >
                  <Ionicons name="chatbubbles-outline" size={25} color="#1E293B" />
                  <View className="absolute top-1 right-1 w-4 h-4 bg-[#1D4ED8] rounded-full border border-white items-center justify-center">
                    <Text style={{ fontSize: 9 }} className="text-white font-bold text-center leading-none">
                      1r
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/notifications")}
                  className="p-2 relative"
                >
                  <Ionicons name="notifications-outline" size={25} color="#1E293B" />
                  <View className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border border-white items-center justify-center">
                    <Text style={{ fontSize: 9 }} className="text-white font-bold text-center leading-none">
                      2
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* Search Bar Wrapper */}
          <Animated.View layout={Layout.springify().damping(18)} className="flex-row items-center mb-2">
            {isSearchFocused && (
              <Animated.View entering={FadeInLeft.duration(150)} exiting={FadeOutLeft.duration(150)}>
                <TouchableOpacity
                  onPress={handleCancelSearch}
                  className="mr-3 w-10 h-10 items-center justify-center rounded-full bg-slate-100 border border-slate-200/50"
                  style={{ marginRight: 12 }}
                >
                  <Ionicons name="chevron-back" size={22} color="#1E293B" />
                </TouchableOpacity>
              </Animated.View>
            )}

            <View className="flex-1 flex-row items-center bg-slate-100 px-5 py-3 rounded-full border border-slate-200/50">
              <Ionicons name="search-outline" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                ref={inputRef}
                placeholder="Search doctors, specialities..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={handleSearchFocus}
                className="flex-1 text-slate-800 text-sm font-medium"
                style={{ padding: 0 }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")} style={{ paddingHorizontal: 4 }}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {isSearchFocused ? (
            /* SEARCH CONTEXT STATE */
            <Animated.View layout={Layout.springify().damping(18)} className="flex-1">
              {searchQuery.length > 0 ? (
                /* Search Results Panel */
                <View className="mb-8">
                  <Text className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
                    Search Results ({searchResults.length})
                  </Text>
                  {searchResults.length === 0 ? (
                    <View className="items-center justify-center py-16">
                      <View className="w-16 h-16 bg-white border border-slate-100 rounded-2xl items-center justify-center mb-4">
                        <Ionicons name="search-outline" size={32} color="#94A3B8" />
                      </View>
                      <Text className="text-base font-bold text-slate-800 text-center">
                        No results found
                      </Text>
                      <Text className="text-xs text-slate-400 mt-1 text-center px-4 leading-relaxed">
                        {"We couldn't find any doctor or specialty matching \"" + searchQuery + "\""}
                      </Text>
                    </View>
                  ) : (
                    searchResults.map((doc) => (
                      <TouchableOpacity
                        key={`res-${doc.id}`}
                        onPress={() => router.push(`/doctor/${doc.id}`)}
                        className="flex-row bg-white p-3 rounded-2xl border border-slate-100 mb-4 items-center"
                      >
                        <Image
                          source={{ uri: doc.image }}
                          style={{ width: 60, height: 60, borderRadius: 14, marginRight: 12 }}
                          contentFit="cover"
                        />
                        <View className="flex-1 justify-center">
                          <Text className="text-sm font-bold text-slate-800">
                            {doc.name}
                          </Text>
                          <Text className="text-xs text-slate-400 font-medium mt-0.5">
                            {doc.specialty}
                          </Text>
                          <View className="flex-row items-center mt-1">
                            <Ionicons name="star" size={12} color="#F59E0B" />
                            <Text className="text-xs font-bold text-slate-700 ml-1">
                              {doc.rating}
                            </Text>
                          </View>
                        </View>
                        <View className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-full items-center justify-center">
                          <Ionicons name="chevron-forward" size={14} color="#64748B" />
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              ) : (
                /* Discover Screen (Reusable Component) */
                <SearchDiscover onSelectQuery={handleSelectQuery} />
              )}
            </Animated.View>
          ) : (
            /* DEFAULT DASHBOARD VIEW */
            <Animated.View layout={Layout.springify().damping(18)} className="flex-1">
              {/* Top Doctors */}
              <View className="mb-6">
                <Text className="text-lg font-bold text-slate-900 mb-4">Top Doctors</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 16 }}
                >
                  {TOP_DOCTORS.map((doc) => (
                    <TouchableOpacity
                      key={doc.id}
                      onPress={() => router.push(`/doctor/${doc.id}`)}
                      className="w-44 bg-white p-3 rounded-2xl border border-slate-100"
                    >
                      <Image
                        source={{ uri: doc.image }}
                        style={{ width: "100%", height: 110, borderRadius: 20, marginBottom: 10 }}
                        contentFit="cover"
                      />
                      <Text className="text-sm font-bold text-slate-800" numberOfLines={1}>
                        {doc.name}
                      </Text>
                      <Text className="text-xs text-slate-400 font-medium mt-0.5">
                        {doc.specialty}
                      </Text>
                      <View className="flex-row items-center mt-2">
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <Text className="text-xs font-bold text-slate-700 ml-1">
                          {doc.rating}
                        </Text>
                        <Text className="text-xs text-slate-400 ml-1">
                          ({doc.reviews})
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Specialties */}
              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-bold text-slate-900">Specialities</Text>
                  <TouchableOpacity onPress={() => router.push("/specialities")}>
                    <Text className="text-sm font-bold text-[#1565C0]">See All</Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-row justify-between">
                  {SPECIALTIES.map((spec) => (
                    <TouchableOpacity
                      key={spec.id}
                      onPress={() => router.push({ pathname: "/(tabs)/doctors", params: { specialty: spec.name } })}
                      className="items-center"
                      style={{ width: "22%" }}
                    >
                      <View
                        style={{ backgroundColor: spec.bg }}
                        className="w-12 h-12 rounded-2xl items-center justify-center mb-2"
                      >
                        <Ionicons name={spec.icon} size={22} color={spec.color} />
                      </View>
                      <Text className="text-xs font-bold text-slate-700 text-center" numberOfLines={1}>
                        {spec.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Other Doctors */}
              <View className="mb-8">
                <Text className="text-lg font-bold text-slate-900 mb-4">Other Doctors</Text>
                {OTHER_DOCTORS.map((doc) => (
                  <TouchableOpacity
                    key={doc.id}
                    onPress={() => router.push(`/doctor/${doc.id}`)}
                    className="flex-row bg-white p-3 rounded-2xl border border-slate-100 mb-4 items-center"
                  >
                    <Image
                      source={{ uri: doc.image }}
                      style={{ width: 70, height: 70, borderRadius: 16, marginRight: 14 }}
                      contentFit="cover"
                    />
                    <View className="flex-1 justify-center">
                      <Text className="text-base font-bold text-slate-800">
                        {doc.name}
                      </Text>
                      <Text className="text-xs text-slate-400 font-medium mt-0.5">
                        {doc.specialty}
                      </Text>
                      <View className="flex-row items-center mt-1.5">
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <Text className="text-xs font-bold text-slate-700 ml-1">
                          {doc.rating}
                        </Text>
                        <Text className="text-xs text-slate-400 ml-1">
                          ({doc.reviews} reviews)
                        </Text>
                      </View>
                    </View>
                    <View className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-full items-center justify-center">
                      <Ionicons name="chevron-forward" size={16} color="#64748B" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}
        </PullToRefresh>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
});
