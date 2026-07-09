import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface SpecialtyItem {
  id: string;
  name: string;
  doctorCount: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
}

const ALL_SPECIALTIES: SpecialtyItem[] = [
  { id: "1", name: "Cardiology", doctorCount: 18, icon: "heart", color: "#EF4444", bg: "#FEF2F2" },
  { id: "2", name: "Pediatrics", doctorCount: 24, icon: "body", color: "#3B82F6", bg: "#EFF6FF" },
  { id: "3", name: "Dermatology", doctorCount: 14, icon: "sparkles", color: "#10B981", bg: "#ECFDF5" },
  { id: "4", name: "Neurology", doctorCount: 12, icon: "pulse", color: "#8B5CF6", bg: "#F5F3FF" },
  { id: "5", name: "Orthopedics", doctorCount: 16, icon: "fitness", color: "#F59E0B", bg: "#FFFBEB" },
  { id: "6", name: "Ophthalmology", doctorCount: 10, icon: "eye", color: "#EC4899", bg: "#FDF2F8" },
  { id: "7", name: "Dentistry", doctorCount: 20, icon: "medical", color: "#06B6D4", bg: "#ECFEFF" },
  { id: "8", name: "Psychiatry", doctorCount: 15, icon: "chatbubbles", color: "#6366F1", bg: "#EEF2FF" },
  { id: "9", name: "Gastroenterology", doctorCount: 9, icon: "flask", color: "#14B8A6", bg: "#F0FDF4" },
  { id: "10", name: "Oncology", doctorCount: 8, icon: "ribbon", color: "#F43F5E", bg: "#FFF1F2" },
  { id: "11", name: "General Medicine", doctorCount: 32, icon: "medkit", color: "#0EA5E9", bg: "#F0F9FF" },
  { id: "12", name: "Radiology", doctorCount: 7, icon: "aperture", color: "#64748B", bg: "#F8FAFC" },
];

export default function SpecialitiesScreen() {
  const [search, setSearch] = useState("");

  const filteredSpecialties = ALL_SPECIALTIES.filter((spec) =>
    spec.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100 mr-3"
        >
          <Ionicons name="chevron-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900">All Specialities</Text>
      </View>

      {/* Search Input */}
      <View className="px-6 py-4 bg-white border-b border-slate-100">
        <View className="flex-row items-center bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <Ionicons name="search-outline" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search specialities..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            className="flex-1 text-slate-800 text-sm font-medium"
            style={{ padding: 0 }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Grid List */}
      {filteredSpecialties.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center mb-4 shadow-sm border border-slate-100">
            <Ionicons name="alert-circle-outline" size={32} color="#94A3B8" />
          </View>
          <Text className="text-lg font-bold text-slate-800 text-center mb-1">
            No Specialities Found
          </Text>
          <Text className="text-sm text-slate-500 text-center">
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
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm items-center mb-4"
              style={{ width: "48%" }}
            >
              <View
                style={{ backgroundColor: item.bg }}
                className="w-14 h-14 rounded-2xl items-center justify-center mb-3 shadow-sm"
              >
                <Ionicons name={item.icon} size={26} color={item.color} />
              </View>
              <Text className="text-sm font-bold text-slate-800 text-center mb-1" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-xs text-slate-400 font-semibold text-center">
                {item.doctorCount} Doctors
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
