import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  UIManager,
  LayoutAnimation,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ALL_DOCTORS, SPECIALTIES } from "../../constants/data";
import { useColorScheme } from "nativewind";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type SortOption = "None" | "Rating" | "Experience" | "Patients";

export default function DoctorsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const params = useLocalSearchParams();
  const routeSpecialty = params.specialty as string;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [minExperience, setMinExperience] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("None");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Sync route specialty parameter when navigated from other pages
  useEffect(() => {
    if (routeSpecialty) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSelectedSpecialty(routeSpecialty);
      // Clear parameter to avoid locks on tab switches
      router.setParams({ specialty: "" });
    }
  }, [routeSpecialty]);

  const handleSelectSpecialty = (specialty: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedSpecialty(specialty);
  };

  const handleResetFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSearchQuery("");
    setSelectedSpecialty("All");
    setMinRating(null);
    setMinExperience(null);
    setSortBy("None");
  };

  const filteredDoctors = useMemo(() => {
    let result = ALL_DOCTORS.filter((doc) => {
      // Search text match
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());

      // Specialty match
      const matchesSpecialty =
        selectedSpecialty === "All" ||
        doc.specialty.toLowerCase() === selectedSpecialty.toLowerCase() ||
        doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()) ||
        selectedSpecialty.toLowerCase().includes(doc.specialty.toLowerCase());

      // Rating match
      const matchesRating = minRating === null || doc.rating >= minRating;

      // Experience match
      const expNumber = parseInt(doc.experience.replace(/[^0-9]/g, "")) || 0;
      const matchesExperience = minExperience === null || expNumber >= minExperience;

      return matchesSearch && matchesSpecialty && matchesRating && matchesExperience;
    });

    // Sorting
    if (sortBy === "Rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "Experience") {
      result = [...result].sort((a, b) => {
        const expA = parseInt(a.experience.replace(/[^0-9]/g, "")) || 0;
        const expB = parseInt(b.experience.replace(/[^0-9]/g, "")) || 0;
        return expB - expA;
      });
    } else if (sortBy === "Patients") {
      result = [...result].sort((a, b) => {
        const getPatientsValue = (patStr: string) => {
          const clean = patStr.replace(/[^0-9.]/g, "");
          const num = parseFloat(clean) || 0;
          if (patStr.toLowerCase().includes("k")) return num * 1000;
          return num;
        };
        return getPatientsValue(b.patients) - getPatientsValue(a.patients);
      });
    }

    return result;
  }, [searchQuery, selectedSpecialty, minRating, minExperience, sortBy]);

  const hasActiveFilters = minRating !== null || minExperience !== null || sortBy !== "None";

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-surface dark:bg-surface-dark border-b border-border-color dark:border-border-color-dark flex-row justify-between items-center">
        <Text className="text-xl font-bold text-text-main dark:text-text-main-dark">Our Doctors</Text>
        <TouchableOpacity
          onPress={handleResetFilters}
          className="w-8 h-8 rounded-full bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark items-center justify-center"
        >
          <Ionicons name="refresh" size={16} color={isDark ? "#94A3B8" : "#64748B"} />
        </TouchableOpacity>
      </View>

      {/* Search and Filters Button */}
      <View className="bg-surface dark:bg-surface-dark px-6 py-2 border-b border-border-color dark:border-border-color-dark flex-row gap-3">
        <View className="flex-1 flex-row items-center bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-full border border-border-color dark:border-border-color-dark">
          <Ionicons name="search-outline" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search doctors, credentials..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-text-main dark:text-text-main-dark text-sm font-medium"
            style={{ padding: 0 }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={{ paddingHorizontal: 4 }}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setIsFilterModalOpen(true)}
          className="w-11 h-11 bg-slate-100 dark:bg-slate-800 border border-border-color dark:border-border-color-dark rounded-full items-center justify-center relative"
        >
          <Ionicons name="options-outline" size={20} color={isDark ? "#F8FAFC" : "#1E293B"} />
          {hasActiveFilters && (
            <View className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
          )}
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Specialty Filter strip */}
        <View className="py-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}
          >
            <TouchableOpacity
              onPress={() => handleSelectSpecialty("All")}
              className={`px-5 py-2.5 rounded-full border ${
                selectedSpecialty === "All"
                  ? "bg-primary border-primary"
                  : "bg-surface dark:bg-surface-dark border-border-color dark:border-border-color-dark"
              }`}
            >
              <Text className={`text-xs font-bold ${selectedSpecialty === "All" ? "text-white" : "text-text-muted dark:text-text-muted-dark"}`}>
                All Specialities
              </Text>
            </TouchableOpacity>
            {SPECIALTIES.map((spec) => {
              const isSelected = selectedSpecialty.toLowerCase() === spec.name.toLowerCase();
              return (
                <TouchableOpacity
                  key={spec.id}
                  onPress={() => handleSelectSpecialty(spec.name)}
                  className={`px-5 py-2.5 rounded-full border flex-row items-center ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "bg-surface dark:bg-surface-dark border-border-color dark:border-border-color-dark"
                  }`}
                >
                  <Ionicons
                    name={spec.icon}
                    size={14}
                    color={isSelected ? "#FFFFFF" : spec.color}
                    style={{ marginRight: 6 }}
                  />
                  <Text className={`text-xs font-bold ${isSelected ? "text-white" : "text-text-muted dark:text-text-muted-dark"}`}>
                    {spec.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Applied Filters Info Badge */}
        {hasActiveFilters && (
          <View className="px-6 mb-2 flex-row flex-wrap gap-2 items-center">
            <Text className="text-[10px] text-text-light dark:text-text-light-dark font-bold uppercase tracking-wider mr-1">Applied:</Text>
            {minRating && (
              <View className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 px-3 py-1 rounded-full flex-row items-center">
                <Ionicons name="star" size={10} color="#FBBF24" style={{ marginRight: 3 }} />
                <Text className="text-[10px] text-amber-800 dark:text-amber-300 font-bold">{minRating}+ Rating</Text>
              </View>
            )}
            {minExperience && (
              <View className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 px-3 py-1 rounded-full flex-row items-center">
                <Ionicons name="briefcase" size={10} color="#1D4ED8" style={{ marginRight: 3 }} />
                <Text className="text-[10px] text-blue-800 dark:text-blue-300 font-bold">{minExperience}+ Yrs Exp</Text>
              </View>
            )}
            {sortBy !== "None" && (
              <View className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 px-3 py-1 rounded-full flex-row items-center">
                <Ionicons name="funnel" size={10} color="#8B5CF6" style={{ marginRight: 3 }} />
                <Text className="text-[10px] text-purple-800 dark:text-purple-300 font-bold">Sort: {sortBy}</Text>
              </View>
            )}
          </View>
        )}

        {/* List of Doctors */}
        <View className="px-6 pb-20 mt-2">
          {filteredDoctors.length === 0 ? (
            <View className="items-center justify-center py-20 bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark rounded-3xl p-8">
              <View className="w-16 h-16 bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark rounded-2xl items-center justify-center mb-4">
                <Ionicons name="search-outline" size={32} color="#94A3B8" />
              </View>
              <Text className="text-base font-bold text-text-main dark:text-text-main-dark text-center">
                No doctors found
              </Text>
              <Text className="text-xs text-text-muted dark:text-text-muted-dark mt-1 text-center px-4 leading-relaxed mb-6">
                Try refining your keywords or resetting filters to find matching doctors.
              </Text>
              <TouchableOpacity
                onPress={handleResetFilters}
                className="bg-[#1565C0] px-6 py-3 rounded-full"
              >
                <Text className="text-white font-bold text-xs">Reset All Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredDoctors.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                onPress={() => router.push(`/doctor/${doc.id}`)}
                className="bg-white border border-slate-100 rounded-3xl p-4 mb-4 shadow-sm shadow-slate-100/50 flex-row"
              >
                <Image
                  source={{ uri: doc.image }}
                  style={{ width: 85, height: 95, borderRadius: 16 }}
                  contentFit="cover"
                />
                <View className="flex-1 ml-4 justify-between py-1">
                  <View>
                    <Text className="text-base font-bold text-slate-900 leading-tight">
                      {doc.name}
                    </Text>
                    <Text className="text-xs font-bold text-[#1D4ED8] mt-0.5">
                      {doc.specialty}
                    </Text>
                  </View>
                  
                  {/* Stats Row */}
                  <View className="flex-row gap-4 mt-2">
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={12} color="#FBBF24" />
                      <Text className="text-[11px] font-bold text-slate-700 ml-1">
                        {doc.rating}
                      </Text>
                      <Text className="text-[10px] text-slate-400 ml-0.5">
                        ({doc.reviews})
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="briefcase-outline" size={12} color="#64748B" />
                      <Text className="text-[11px] font-bold text-slate-600 ml-1">
                        {doc.experience}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center mt-2.5 pt-2 border-t border-slate-100">
                    <Text className="text-[10px] text-slate-400 font-bold">
                      {doc.patients} Patients
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-[11px] font-bold text-[#1565C0] mr-1">Book Session</Text>
                      <Ionicons name="chevron-forward" size={12} color="#1565C0" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Flexible Filters Modal */}
      <Modal
        visible={isFilterModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsFilterModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View className="bg-white rounded-t-[40px] px-6 pt-6 pb-10 w-full max-h-[85%] absolute bottom-0 shadow-2xl">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-lg font-bold text-slate-900">Filter Options</Text>
                <Text className="text-xs text-slate-400 font-medium">Refine your search for doctors</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsFilterModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Sort Section */}
              <View className="mb-6">
                <Text className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Sort Results By</Text>
                <View className="flex-row flex-wrap gap-2.5">
                  {(["None", "Rating", "Experience", "Patients"] as SortOption[]).map((opt) => {
                    const isSelected = sortBy === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => setSortBy(opt)}
                        style={{ width: "47%" }}
                        className={`py-3 rounded-2xl items-center border ${
                          isSelected ? "bg-blue-50 border-[#1D4ED8]" : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <Text className={`text-xs font-bold ${isSelected ? "text-[#1D4ED8]" : "text-slate-700"}`}>
                          {opt === "None" ? "Default Order" : `${opt} (High to Low)`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Rating Section */}
              <View className="mb-6">
                <Text className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Minimum Rating</Text>
                <View className="flex-row flex-wrap gap-2">
                  {[null, 4.6, 4.7, 4.8, 4.9].map((val) => {
                    const isSelected = minRating === val;
                    return (
                      <TouchableOpacity
                        key={String(val)}
                        onPress={() => setMinRating(val)}
                        style={{ width: "31%" }}
                        className={`py-3 rounded-2xl items-center border ${
                          isSelected ? "bg-blue-50 border-[#1D4ED8]" : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <Text className={`text-xs font-bold ${isSelected ? "text-[#1D4ED8]" : "text-slate-700"}`}>
                          {val === null ? "Any Rating" : `${val} ★`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Experience Section */}
              <View className="mb-8">
                <Text className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Minimum Experience</Text>
                <View className="flex-row flex-wrap gap-2">
                  {[null, 5, 8, 10, 12, 14].map((val) => {
                    const isSelected = minExperience === val;
                    return (
                      <TouchableOpacity
                        key={String(val)}
                        onPress={() => setMinExperience(val)}
                        style={{ width: "31%" }}
                        className={`py-3 rounded-2xl items-center border ${
                          isSelected ? "bg-blue-50 border-[#1D4ED8]" : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <Text className={`text-xs font-bold ${isSelected ? "text-[#1D4ED8]" : "text-slate-700"}`}>
                          {val === null ? "Any Experience" : `${val}+ Yrs`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Actions */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    handleResetFilters();
                    setIsFilterModalOpen(false);
                  }}
                  className="flex-1 py-4 rounded-full border border-slate-200 bg-white items-center"
                >
                  <Text className="text-slate-500 font-bold text-sm">Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsFilterModalOpen(false)}
                  className="flex-1 py-4 rounded-full bg-[#1D4ED8] items-center shadow-md shadow-blue-500/20"
                >
                  <Text className="text-white font-bold text-sm">Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
});
