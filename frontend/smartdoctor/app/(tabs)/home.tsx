import React from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image } from "expo-image";

const HEALTH_PHRASES = [
  "How are you feeling today?",
  "How's your health today?",
  "Ready for your daily check-in?",
  "Hope you are feeling well!",
  "Let's track your wellness today.",
  "Ready to consult our AI?"
];

export default function HomeScreen() {
  const [phrase, setPhrase] = React.useState("");

  React.useEffect(() => {
    const randomPhrase = HEALTH_PHRASES[Math.floor(Math.random() * HEALTH_PHRASES.length)];
    setPhrase(randomPhrase);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView className="flex-1 px-6 pt-4">
        {/* User Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View className="flex-row items-center">
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150" }}
              style={{ width: 46, height: 46, borderRadius: 23, marginRight: 12 }}
              className="border-2 border-white shadow-sm"
            />
            <View>
              <Text className="text-xl font-bold text-slate-900">
                Hello John
              </Text>
              <Text className="text-slate-500 text-xs font-medium mt-0.5">
                {phrase || "How are you feeling today?"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/notifications")}
            className="p-2.5 relative"
          >
            <Ionicons name="notifications-outline" size={26} color="#1E293B" />
            <View className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border border-white items-center justify-center">
              <Text style={{ fontSize: 9 }} className="text-white font-bold text-center leading-none">
                2
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white px-4 py-3.5 rounded-2xl border border-slate-100 shadow-sm mb-8">
          <Ionicons name="search-outline" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search doctors, specialities..."
            placeholderTextColor="#94A3B8"
            className="flex-1 text-slate-800 text-sm font-medium"
            style={{ padding: 0 }}
          />
          <TouchableOpacity style={{ paddingLeft: 8 }}>
            <Ionicons name="options-outline" size={20} color="#1565C0" />
          </TouchableOpacity>
        </View>

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
                className="w-44 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm"
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
                className="items-center"
                style={{ width: "22%" }}
              >
                <View
                  style={{ backgroundColor: spec.bg }}
                  className="w-12 h-12 rounded-2xl items-center justify-center mb-2 shadow-sm"
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

        {/* All Doctors */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-slate-900 mb-4">All Doctors</Text>
          {OTHER_DOCTORS.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              className="flex-row bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-4 items-center"
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
      </ScrollView>
    </SafeAreaView>
  );
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  image: string;
}

const TOP_DOCTORS: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Jenkins",
    specialty: "Cardiologist",
    rating: 4.9,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200",
  },
  {
    id: "2",
    name: "Dr. Robert Chen",
    specialty: "Pediatrician",
    rating: 4.8,
    reviews: 96,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200",
  },
  {
    id: "3",
    name: "Dr. Emma Watson",
    specialty: "Dermatologist",
    rating: 4.9,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=200",
  },
];

const OTHER_DOCTORS: Doctor[] = [
  {
    id: "4",
    name: "Dr. James Wilson",
    specialty: "Neurologist",
    rating: 4.7,
    reviews: 88,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200",
  },
  {
    id: "5",
    name: "Dr. Lisa Anderson",
    specialty: "Gynecologist",
    rating: 4.8,
    reviews: 110,
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=200",
  },
  {
    id: "6",
    name: "Dr. Michael Chang",
    specialty: "Orthopedics",
    rating: 4.6,
    reviews: 74,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=200",
  },
];

interface Specialty {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
}

const SPECIALTIES: Specialty[] = [
  { id: "1", name: "Cardiology", icon: "heart", color: "#EF4444", bg: "#FEF2F2" },
  { id: "2", name: "Pediatrics", icon: "body", color: "#3B82F6", bg: "#EFF6FF" },
  { id: "3", name: "Dermatology", icon: "sparkles", color: "#10B981", bg: "#ECFDF5" },
  { id: "4", name: "Neurology", icon: "pulse", color: "#8B5CF6", bg: "#F5F3FF" },
];
