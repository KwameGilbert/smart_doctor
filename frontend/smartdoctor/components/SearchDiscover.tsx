import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

interface SearchDiscoverProps {
  onSelectQuery: (query: string) => void;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  image: string;
}

const RECENT_SEARCHES = [
  {
    id: "1",
    name: "Dr. Sarah Jenkins",
    specialty: "Cardiologist",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200",
  },
  {
    id: "2",
    name: "Dr. Robert Chen",
    specialty: "Pediatrician",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200",
  },
  {
    id: "5",
    name: "Dr. Lisa Anderson",
    specialty: "Gynecologist",
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=200",
  },
];

const TRENDING_TAGS = [
  "Pediatrician",
  "Cardiology",
  "Dermatologist",
  "Neurologist",
  "Orthopedics",
  "Gynecologist",
];

const MOST_SEARCHED: Doctor[] = [
  {
    id: "3",
    name: "Dr. Emma Watson",
    specialty: "Dermatologist",
    rating: 4.9,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=200",
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    specialty: "Neurologist",
    rating: 4.7,
    reviews: 88,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200",
  },
];

export default function SearchDiscover({ onSelectQuery }: SearchDiscoverProps) {
  return (
    <View className="flex-1">
      {/* Recent Searches */}
      <View className="mb-6">
        <Text className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
          Recent Searches
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 16 }}
        >
          {RECENT_SEARCHES.map((doc) => (
            <TouchableOpacity
              key={`recent-${doc.id}`}
              onPress={() => onSelectQuery(doc.name)}
              className="items-center"
              style={{ width: 80 }}
            >
              <Image
                source={{ uri: doc.image }}
                style={{ width: 56, height: 56, borderRadius: 28, marginBottom: 6 }}
                contentFit="cover"
              />
              <Text className="text-xs font-bold text-slate-800 text-center" numberOfLines={1}>
                {doc.name.split(" ").slice(1).join(" ")}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Trending Queries */}
      <View className="mb-6">
        <Text className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
          Trending Searches
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {TRENDING_TAGS.map((tag, idx) => (
            <TouchableOpacity
              key={`tag-${idx}`}
              onPress={() => onSelectQuery(tag)}
              className="bg-slate-100 px-4 py-2 rounded-full border border-slate-200/20"
            >
              <Text className="text-xs font-bold text-slate-600">
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Most Searched Doctors */}
      <View className="mb-8">
        <Text className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
          Most Searched
        </Text>
        {MOST_SEARCHED.map((doc) => (
          <TouchableOpacity
            key={`most-${doc.id}`}
            onPress={() => onSelectQuery(doc.name)}
            className="flex-row bg-white p-3 rounded-2xl border border-slate-100 mb-4 items-center"
          >
            <Image
              source={{ uri: doc.image }}
              style={{ width: 50, height: 50, borderRadius: 12, marginRight: 12 }}
              contentFit="cover"
            />
            <View className="flex-1 justify-center">
              <Text className="text-sm font-bold text-slate-800">
                {doc.name}
              </Text>
              <Text className="text-xs text-slate-400 font-medium mt-0.5">
                {doc.specialty}
              </Text>
            </View>
            <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-lg">
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text className="text-xs font-bold text-amber-700 ml-1">
                {doc.rating}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
