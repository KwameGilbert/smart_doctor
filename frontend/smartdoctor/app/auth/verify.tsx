import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import AuthPattern from "../../components/AuthPattern";
import { authApi } from "../../services/api/auth";
import { tokenStorage } from "../../services/api/storage";
import { useColorScheme } from "nativewind";

export default function VerifyScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const params = useLocalSearchParams();
  const emailParam = (params.email as string) || "";

  const [emailOrPhone, setEmailOrPhone] = useState(emailParam);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errors, setErrors] = useState<{ emailOrPhone?: string; code?: string }>({});

  useEffect(() => {
    if (emailParam) {
      setEmailOrPhone(emailParam);
    }
  }, [emailParam]);

  const handleVerify = async () => {
    let validationErrors: { emailOrPhone?: string; code?: string } = {};

    if (!emailOrPhone) {
      validationErrors.emailOrPhone = "Email or Phone number is required";
    }
    if (!code) {
      validationErrors.code = "Verification code is required";
    } else if (code.trim().length < 4) {
      validationErrors.code = "Verification code must be at least 4 digits";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await authApi.verify({
        emailOrPhone: emailOrPhone.trim(),
        code: code.trim(),
      });

      if (response.status === "success" && response.data?.token) {
        // Save token and navigate home
        await tokenStorage.saveToken(response.data.token);
        Alert.alert("Success", "Account verified successfully!", [
          {
            text: "OK",
            onPress: () => router.replace("/home"),
          },
        ]);
      } else {
        Alert.alert("Verification Failed", response.message || "Invalid verification code.");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      const serverMessage = error.response?.data?.message || "Invalid verification code. Please check and try again.";
      Alert.alert("Verification Error", serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!emailOrPhone) {
      setErrors({ emailOrPhone: "Email or Phone number is required to resend OTP" });
      return;
    }

    setErrors({});
    setResending(true);

    try {
      const response = await authApi.resendOtp(emailOrPhone.trim());
      if (response.status === "success") {
        Alert.alert("OTP Resent", "A new verification code has been sent to your email/phone.");
      } else {
        Alert.alert("Error", response.message || "Failed to resend verification code.");
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      const serverMessage = error.response?.data?.message || "Failed to resend code. Please try again later.";
      Alert.alert("Error", serverMessage);
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark relative" edges={["top", "bottom"]}>
      <AuthPattern />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center px-6 py-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color={isDark ? "#F8FAFC" : "#1E293B"} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 px-8 pt-4 justify-between pb-8">
          <View>
            <Text className="text-3xl font-bold text-text-main dark:text-text-main-dark mb-2">
              Verify Account
            </Text>
            <Text className="text-base text-text-muted dark:text-text-muted-dark mb-8">
              Enter the verification code sent to your email or phone number.
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
              label="Verification Code"
              placeholder="Enter OTP code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              autoCapitalize="none"
              leftIconName="key-outline"
              error={errors.code}
            />
          </View>

          {/* Bottom actions */}
          <View className="mt-8">
            <Button
              title="Verify Code"
              loading={loading}
              onPress={handleVerify}
              className="mb-4"
            />

            <Button
              title="Resend Code"
              variant="secondary"
              loading={resending}
              onPress={handleResend}
              className="mb-6"
            />

            {/* Footer */}
            <View className="flex-row justify-center items-center">
              <Text className="text-text-muted dark:text-text-muted-dark text-sm">
                Want to try signing in instead?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/auth/login")}>
                <Text className="text-primary font-bold text-sm">Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
