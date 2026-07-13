import React from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleProp,
  ViewStyle,
  StyleSheet,
} from "react-native";

interface KeyboardSafeViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardVerticalOffset?: number;
  behavior?: "padding" | "height" | "position" | undefined;
}

export default function KeyboardSafeView({
  children,
  style,
  contentContainerStyle,
  keyboardVerticalOffset = Platform.OS === "ios" ? 0 : 0,
  behavior = Platform.OS === "ios" ? "padding" : undefined,
}: KeyboardSafeViewProps) {
  return (
    <KeyboardAvoidingView
      behavior={behavior}
      style={[styles.container, style]}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
