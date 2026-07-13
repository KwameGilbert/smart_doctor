import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Button from "../components/ui/Button";
import AuthGridBackground from "../components/AuthGridBackground";
import { tokenStorage } from "../services/api/storage";

export default function AuthWelcomeScreen() {
  useEffect(() => {
    const checkToken = async () => {
      const token = await tokenStorage.getToken();
      if (token) {
        router.replace("/home");
      }
    };
    checkToken();
  }, []);
  return (
    <View style={styles.mainContainer}>
      {/* Dynamic Scrolling Grid Background */}
      <AuthGridBackground />

      {/* Foreground Content */}
      <SafeAreaView style={styles.safeArea}>
        {/* Top Spacer */}
        <View />

        {/* Hero Section */}
        <View className="items-center">
          <View className="w-32 h-32 bg-[#E6F4FE]/90 rounded-full items-center justify-center mb-8 shadow-sm border border-white">
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
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 32,
  },
});
