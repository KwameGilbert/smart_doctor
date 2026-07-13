import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import AuthPattern from "../../components/AuthPattern";
import { authApi } from "../../services/api/auth";
import { tokenStorage } from "../../services/api/storage";
import { useAlert } from "../../components/ui/AlertModal";

export default function LoginScreen() {
  const { showAlert } = useAlert();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ emailOrPhone?: string; password?: string }>(
    {},
  );

  const handleLogin = async () => {
    // Basic validation
    let validationErrors: { emailOrPhone?: string; password?: string } = {};
    if (!emailOrPhone) {
      validationErrors.emailOrPhone = "Email or Phone number is required";
    } else {
      const isEmail = /\S+@\S+\.\S+/.test(emailOrPhone);
      const isPhone = /^\+?[0-9]{8,15}$/.test(emailOrPhone.replace(/[\s-]/g, ""));
      if (!isEmail && !isPhone) {
        validationErrors.emailOrPhone = "Please enter a valid email or phone number";
      }
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

    try {
      const response = await authApi.login({
        email: emailOrPhone.trim(),
        password,
      });

      if (response.status === "success" && response.data?.token) {
        // Save the JWT token securely
        await tokenStorage.saveToken(response.data.token);
        
        // Redirect to main home dashboard
        router.replace("/home");
      } else if (response.data && response.data.isVerified === false) {
        showAlert(
          "Verification Required",
          "Your account is registered but not yet verified. Please verify using the OTP code sent to you.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Verify Now",
              onPress: () => {
                router.push({
                  pathname: "/auth/verify",
                  params: { email: emailOrPhone.trim() },
                });
              },
            },
          ]
        );
      } else {
        showAlert("Login Failed", response.message || "Invalid email or password.");
      }
    } catch (error: any) {
      console.error("Login request error:", error);
      const serverMessage = error.response?.data?.message || "Something went wrong. Please check your connection.";
      showAlert("Login Error", serverMessage);
    } finally {
      setLoading(false);
    }
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
              label="Email or Phone Number"
              placeholder="name@example.com or +123456789"
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              keyboardType="default"
              autoCapitalize="none"
              leftIconName="person-outline"
              error={errors.emailOrPhone}
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
