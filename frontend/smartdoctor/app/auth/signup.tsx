import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import AuthPattern from "../../components/AuthPattern";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleSignup = () => {
    // Basic validation
    let validationErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name) {
      validationErrors.name = "Full Name is required";
    }

    if (!email) {
      validationErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      validationErrors.email = "Please enter a valid email";
    }

    if (!phone) {
      validationErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9]{8,15}$/.test(phone.replace(/[\s-]/g, ""))) {
      validationErrors.phone = "Please enter a valid phone number";
    }

    if (!password) {
      validationErrors.password = "Password is required";
    } else if (password.length < 6) {
      validationErrors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    // Mock register/auth success and navigation
    setTimeout(() => {
      setLoading(false);
      router.replace("/home");
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
        <View className="flex-1 px-8 pt-2 justify-between pb-8">
          <View>
            <Text className="text-3xl font-bold text-slate-900 mb-2">
              Create Account
            </Text>
            <Text className="text-base text-slate-500 mb-6">
              Join us to manage your health intelligently.
            </Text>

            {/* Form */}
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              leftIconName="person-outline"
              error={errors.name}
            />

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
              label="Phone Number"
              placeholder="e.g. +123456789"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
              leftIconName="call-outline"
              error={errors.phone}
            />

            <Input
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              leftIconName="lock-closed-outline"
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              leftIconName="lock-closed-outline"
              error={errors.confirmPassword}
            />
          </View>

          {/* Bottom actions */}
          <View className="mt-8">
            <Button
              title="Sign Up"
              loading={loading}
              onPress={handleSignup}
              className="mb-6"
            />

            {/* Terms of Use & Privacy Policy */}
            <View className="items-center px-4 mb-6">
              <Text className="text-center text-xs leading-relaxed text-slate-400">
                {"By continuing, you agree to our "}
                <Text className="font-semibold text-[#1565C0] underline">
                  Terms of Use
                </Text>
                {" and "}
                <Text className="font-semibold text-[#1565C0] underline">
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>

            {/* Footer */}
            <View className="flex-row justify-center items-center">
              <Text className="text-slate-500 text-sm">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/auth/login")}>
                <Text className="text-[#1565C0] font-bold text-sm">Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
