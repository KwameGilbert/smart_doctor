import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Button from "../components/ui/Button";

export default function AuthWelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-between p-8">
      {/* Top spacer */}
      <View />

      {/* Hero section */}
      <View className="items-center">
        <View className="w-32 h-32 bg-[#E6F4FE] rounded-full items-center justify-center mb-8 shadow-sm">
          <Ionicons name="medical" size={72} color="#1565C0" />
        </View>
        <Text className="text-3xl font-bold text-slate-900 text-center mb-3">
          Smart Doctor
        </Text>
        <Text className="text-base text-slate-500 text-center px-4 leading-relaxed">
          Your AI-powered healthcare assistant. Consult symptoms, manage
          records, and book appointments securely.
        </Text>
      </View>

      {/* Buttons */}
      <View className="w-full">
        <Button
          title="Log In"
          variant="primary"
          onPress={() => router.push("/auth/login")}
          className="mb-4"
        />
        <Button
          title="Sign Up"
          variant="secondary"
          onPress={() => router.push("/auth/signup")}
        />
      </View>
    </SafeAreaView>
  );
}
