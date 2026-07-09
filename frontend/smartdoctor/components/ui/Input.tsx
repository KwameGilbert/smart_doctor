import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIconName?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
}

export default function Input({
  label,
  error,
  leftIconName,
  secureTextEntry = false,
  className = "",
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPassword = secureTextEntry;
  const showPasswordToggle = isPassword;
  const isSecure = isPassword && !isPasswordVisible;

  return (
    <View className={`w-full mb-5 ${className}`}>
      {label && (
        <Text className="text-slate-600 font-medium mb-2 text-sm">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center border rounded-2xl px-4 h-14 bg-slate-50 ${
          isFocused
            ? "border-[#1565C0]"
            : error
            ? "border-red-500"
            : "border-slate-200"
        }`}
      >
        {leftIconName && (
          <Ionicons
            name={leftIconName}
            size={20}
            color={isFocused ? "#1565C0" : error ? "#EF4444" : "#94A3B8"}
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          className="flex-1 text-slate-800 text-base h-full"
          placeholderTextColor="#94A3B8"
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            className="p-1"
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-1 font-medium">{error}</Text>
      )}
    </View>
  );
}
