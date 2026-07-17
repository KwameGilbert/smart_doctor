import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import AuthPattern from "../../components/AuthPattern";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResetPassword = () => {
    if (!email) {
      setError("Email address is required");
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);
      setCountdown(59);
    }, 1500);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCountdown(59);
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-white relative" edges={["top", "bottom"]}>
      <AuthPattern />
      
      {/* Header Back Button */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-between",
          paddingHorizontal: 32,
          paddingBottom: 32,
          paddingTop: 16,
        }}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        {!isSuccess ? (
          <View className="flex-1 justify-between">
            <View>
              <Text className="text-3xl font-bold text-slate-900 mb-2">
                Forgot Password
              </Text>
              <Text className="text-base text-slate-500 mb-8 leading-relaxed">
                Enter your email address associated with your account, and we will send you instructions to reset your password.
              </Text>

              {/* Form Input */}
              <Input
                label="Email Address"
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIconName="mail-outline"
                error={error}
              />
            </View>

            <View className="mt-8">
              <Button
                title="Send Reset Instructions"
                loading={loading}
                onPress={handleResetPassword}
                className="mb-6"
              />

              <View className="flex-row justify-center items-center">
                <Text className="text-slate-500 text-sm">
                  Remember password?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.push("/auth/login")}>
                  <Text className="text-[#1565C0] font-bold text-sm">Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View className="flex-1 justify-between">
            <View className="items-center justify-center pt-8">
              <View className="w-24 h-24 bg-[#E6F4FE] rounded-full items-center justify-center mb-8 shadow-sm">
                <Ionicons name="mail-open" size={48} color="#1565C0" />
              </View>
              
              <Text className="text-2xl font-bold text-slate-900 mb-3 text-center">
                Check Your Email
              </Text>
              
              <Text className="text-base text-slate-500 text-center leading-relaxed mb-4 px-2">
                We have sent secure password reset instructions to:
              </Text>
              
              <Text className="text-base font-semibold text-slate-800 text-center mb-6">
                {email}
              </Text>
              
              <Text className="text-xs text-slate-400 text-center leading-relaxed">
                {"Didn't receive the email? Check your spam folder or try resending."}
              </Text>
            </View>

            <View className="mt-8">
              <Button
                title="Back to Log In"
                onPress={() => router.replace("/auth/login")}
                className="mb-4"
              />

              <TouchableOpacity
                onPress={handleResend}
                disabled={countdown > 0}
                className="py-4 rounded-2xl items-center justify-center border border-slate-200"
                style={{ opacity: countdown > 0 ? 0.7 : 1 }}
              >
                <Text className="font-bold text-sm text-slate-600">
                  {countdown > 0 ? `Resend Email in ${countdown}s` : "Resend Email"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
