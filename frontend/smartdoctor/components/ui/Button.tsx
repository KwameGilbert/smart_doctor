import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
}

export default function Button({
  title,
  variant = "primary",
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  let btnStyle = "bg-[#1565C0]";
  let textStyle = "text-white";

  if (variant === "secondary") {
    btnStyle = "bg-[#E6F4FE]";
    textStyle = "text-[#1565C0]";
  } else if (variant === "outline") {
    btnStyle = "border border-slate-200 bg-transparent";
    textStyle = "text-slate-800";
  }

  if (disabled || loading) {
    btnStyle += " opacity-60";
  }

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      className={`w-full py-4 rounded-2xl items-center justify-center ${btnStyle} ${className}`}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "secondary" ? "#1565C0" : "#ffffff"}
        />
      ) : (
        <Text className={`font-bold text-lg ${textStyle}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
