import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-between p-8">
      {/* Profile info section */}
      <View className="items-center justify-center flex-1 w-full">
        <View className="w-20 h-20 bg-[#E6F4FE] rounded-2xl items-center justify-center mb-6">
          <Ionicons name="person" size={40} color="#1565C0" />
        </View>
        <Text className="text-2xl font-bold text-slate-900 mb-2">Profile & Settings</Text>
        <Text className="text-base text-slate-500 text-center mb-8 px-4">
          Update personal details, set emergency contacts, adjust notification preferences, and manage security options.
        </Text>
        <TouchableOpacity className="bg-[#1565C0] px-6 py-3.5 rounded-2xl shadow-sm w-full items-center">
          <Text className="text-white font-bold text-base">Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Log out section */}
      <TouchableOpacity
        onPress={() => router.replace("/auth")}
        className="border border-red-100 bg-red-50/20 py-4 rounded-2xl items-center justify-center w-full mb-4"
      >
        <Text className="text-red-500 font-bold text-sm">Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
