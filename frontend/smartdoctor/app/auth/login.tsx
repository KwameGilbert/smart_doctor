import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import AuthPattern from "../../components/AuthPattern";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const handleLogin = () => {
    router.replace("/home"); return; // Dev bypass: directly navigate to home pages
    // Basic validation
    let validationErrors: { email?: string; password?: string } = {};
    if (!email) {
      validationErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      validationErrors.email = "Please enter a valid email";
    }

    if (!password) {
      validationErrors.password = "Password is required";
    } else if (password.length < 6) {
      validationErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    // Mock Login action
    setTimeout(() => {
      setLoading(false);
      router.replace("/home"); // Redirection to home tabs
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white relative" edges={["top", "bottom"]}>
      <AuthPattern />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center px-6 py-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 px-8 pt-4 justify-between pb-8">
          <View>
            <Text className="text-3xl font-bold text-slate-900 mb-2">
              Welcome Back
            </Text>
            <Text className="text-base text-slate-500 mb-8">
              Sign in to continue your healthcare tracking.
            </Text>

            {/* Form */}
            <Input
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIconName="mail-outline"
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              leftIconName="lock-closed-outline"
              error={errors.password}
            />

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => router.push("/auth/forgot-password")}
              className="items-end mb-8"
            >
              <Text className="text-[#1565C0] font-semibold text-sm">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom actions */}
          <View>
            <Button
              title="Log In"
              loading={loading}
              onPress={handleLogin}
              className="mb-6"
            />

            {/* Footer */}
            <View className="flex-row justify-center items-center">
              <Text className="text-slate-500 text-sm">
                {"Don't have an account? "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/auth/signup")}>
                <Text className="text-[#1565C0] font-bold text-sm">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
