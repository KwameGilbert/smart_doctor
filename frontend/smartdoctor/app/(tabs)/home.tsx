import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView className="flex-1 px-6 pt-4">
        {/* User Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-slate-500 text-sm font-medium">
              Welcome back
            </Text>
            <Text className="text-2xl font-bold text-slate-900">Dr. John Doe</Text>
          </View>
          <TouchableOpacity className="w-12 h-12 bg-white rounded-full items-center justify-center border border-slate-100 shadow-sm">
            <Ionicons name="notifications-outline" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <View className="w-full bg-[#1565C0] p-6 rounded-3xl mb-8 flex-row items-center justify-between shadow-sm">
          <View className="flex-1 pr-4">
            <Text className="text-white text-xl font-bold mb-2">
              How are you feeling today?
            </Text>
            <Text className="text-white/80 text-sm leading-relaxed mb-4">
              Describe your symptoms to our advanced AI and receive instant,
              tailored health guides.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/chat")}
              className="bg-white px-4 py-2.5 rounded-xl self-start"
            >
              <Text className="text-[#1565C0] font-bold text-sm">Check Now</Text>
            </TouchableOpacity>
          </View>
          <Ionicons name="sparkles" size={56} color="#E6F4FE" />
        </View>

        {/* Quick Actions */}
        <Text className="text-lg font-bold text-slate-800 mb-4">
          Quick Actions
        </Text>
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
          {/* Card 1 */}
          <TouchableOpacity
            onPress={() => router.push("/appointments")}
            style={{ width: "48%" }}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
          >
            <View className="w-10 h-10 bg-[#E6F4FE] rounded-xl items-center justify-center mb-4">
              <Ionicons name="calendar" size={20} color="#1565C0" />
            </View>
            <Text className="text-base font-bold text-slate-800">
              Book Visit
            </Text>
            <Text className="text-xs text-slate-400 mt-1">
              Schedule appointment
            </Text>
          </TouchableOpacity>

          {/* Card 2 */}
          <TouchableOpacity
            onPress={() => router.push("/records")}
            style={{ width: "48%" }}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
          >
            <View className="w-10 h-10 bg-[#E6F4FE] rounded-xl items-center justify-center mb-4">
              <Ionicons name="document-text" size={20} color="#1565C0" />
            </View>
            <Text className="text-base font-bold text-slate-800">
              Health Records
            </Text>
            <Text className="text-xs text-slate-400 mt-1">
              View files & reports
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
