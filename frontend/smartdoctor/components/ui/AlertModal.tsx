import React, { createContext, useContext, useState, useRef } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

const { width } = Dimensions.get("window");

export interface AlertButton {
  text: string;
  onPress?: () => void | Promise<void>;
  style?: "default" | "cancel" | "destructive";
}

export type AlertType = "success" | "error" | "info" | "warning";

export interface AlertOptions {
  buttons?: AlertButton[];
  type?: AlertType;
}

interface AlertContextType {
  showAlert: (title: string, message: string, options?: AlertOptions | AlertButton[]) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [buttons, setButtons] = useState<AlertButton[]>([]);
  const [type, setType] = useState<AlertType>("info");

  const scaleValue = useRef(new Animated.Value(0.9)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  const showAlert = (
    alertTitle: string,
    alertMessage: string,
    options?: AlertOptions | AlertButton[]
  ) => {
    setTitle(alertTitle);
    setMessage(alertMessage);

    // Determine type from title/message context if not explicitly provided
    let resolvedType: AlertType = "info";
    const lowerTitle = alertTitle.toLowerCase();
    const lowerMsg = alertMessage.toLowerCase();

    if (lowerTitle.includes("success") || lowerTitle.includes("verified") || lowerMsg.includes("successfully")) {
      resolvedType = "success";
    } else if (lowerTitle.includes("error") || lowerTitle.includes("fail") || lowerMsg.includes("invalid") || lowerMsg.includes("could not")) {
      resolvedType = "error";
    } else if (lowerTitle.includes("warning") || lowerTitle.includes("caution") || lowerTitle.includes("clear") || lowerTitle.includes("cancel")) {
      resolvedType = "warning";
    }

    let resolvedButtons: AlertButton[] = [];

    if (Array.isArray(options)) {
      resolvedButtons = options;
    } else if (options) {
      if (options.type) resolvedType = options.type;
      if (options.buttons) resolvedButtons = options.buttons;
    }

    // Default button if none provided
    if (resolvedButtons.length === 0) {
      resolvedButtons = [{ text: "OK" }];
    }

    setButtons(resolvedButtons);
    setType(resolvedType);
    setVisible(true);

    // Animate in
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideAlert = () => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <Ionicons name="checkmark-circle" size={48} color="#10B981" />;
      case "error":
        return <Ionicons name="alert-circle" size={48} color="#EF4444" />;
      case "warning":
        return <Ionicons name="warning" size={48} color="#F59E0B" />;
      default:
        return <Ionicons name="information-circle" size={48} color="#1D4ED8" />;
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal
        transparent
        visible={visible}
        animationType="none"
        onRequestClose={hideAlert}
      >
        <View style={styles.overlay} className="bg-slate-900/60 dark:bg-black/80">
          <Animated.View
            style={[
              styles.alertContainer,
              {
                opacity: opacityValue,
                transform: [{ scale: scaleValue }],
              },
            ]}
            className="bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark"
          >
            {/* Header Icon */}
            <View className="items-center mb-4 mt-2">
              {getIcon()}
            </View>

            {/* Title */}
            {title ? (
              <Text className="text-lg font-bold text-text-main dark:text-text-main-dark text-center mb-2 px-4">
                {title}
              </Text>
            ) : null}

            {/* Message */}
            <Text className="text-sm text-text-muted dark:text-text-muted-dark text-center mb-6 px-4 leading-relaxed">
              {message}
            </Text>

            {/* Buttons Row */}
            <View style={buttons.length > 2 ? styles.buttonColumn : styles.buttonRow}>
              {buttons.map((btn, index) => {
                const isDestructive = btn.style === "destructive";
                const isCancel = btn.style === "cancel";
                
                let btnClass = "bg-primary flex-1 py-3.5 rounded-2xl items-center justify-center mx-1";
                let textClass = "text-white font-bold text-sm";

                if (isCancel) {
                  btnClass = "bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark flex-1 py-3.5 rounded-2xl items-center justify-center mx-1";
                  textClass = "text-text-muted dark:text-text-muted-dark font-bold text-sm";
                } else if (isDestructive) {
                  btnClass = "bg-red-500 flex-1 py-3.5 rounded-2xl items-center justify-center mx-1";
                  textClass = "text-white font-bold text-sm";
                }

                if (buttons.length > 2) {
                  // Stacked button tweaks
                  btnClass = btnClass.replace("mx-1", "my-1 w-full");
                }

                return (
                  <TouchableOpacity
                    key={index}
                    className={btnClass}
                    onPress={async () => {
                      hideAlert();
                      if (btn.onPress) {
                        await btn.onPress();
                      }
                    }}
                  >
                    <Text className={textClass}>{btn.text}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  alertContainer: {
    width: "100%",
    maxWidth: width * 0.85,
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  buttonColumn: {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
});
