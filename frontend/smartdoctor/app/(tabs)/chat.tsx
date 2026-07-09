import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ChatScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center p-8">
      <View className="w-20 h-20 bg-[#E6F4FE] rounded-2xl items-center justify-center mb-6">
        <Ionicons name="chatbubble-ellipses" size={40} color="#1565C0" />
      </View>
      <Text className="text-2xl font-bold text-slate-900 mb-2">AI Symptom Checker</Text>
      <Text className="text-base text-slate-500 text-center mb-8 px-4">
        Our medical AI chatbot will be implemented here to analyze your symptoms, offer guidelines, and recommend next steps.
      </Text>
      <TouchableOpacity className="bg-[#1565C0] px-6 py-3.5 rounded-2xl shadow-sm">
        <Text className="text-white font-bold text-base">Start New Consultation</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
