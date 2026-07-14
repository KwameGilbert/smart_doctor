import React, { useState, useEffect } from "react";
import { useColorScheme } from "nativewind";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { notificationApi } from "../services/api/notification";

interface NotificationItem {
  id: string;
  type: "ai" | "appointment" | "record" | "reminder";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: "ai",
    title: "AI Symptom Analysis Ready",
    message: "Your recent consult for 'Dry cough and fatigue' has been processed. View your home care guide now.",
    time: "10m ago",
    read: false,
  },
  {
    id: "2",
    type: "appointment",
    title: "Appointment Confirmed",
    message: "Your visit with Dr. Sarah Jenkins is scheduled for tomorrow at 10:00 AM.",
    time: "2h ago",
    read: false,
  },
  {
    id: "3",
    type: "record",
    title: "New Health Record",
    message: "Lab results for 'Complete Blood Count' have been uploaded to your secure files.",
    time: "1d ago",
    read: true,
  },
  {
    id: "4",
    type: "reminder",
    title: "Daily Health Check-in",
    message: "Time to log your morning symptoms and track your progress.",
    time: "2d ago",
    read: true,
  },
  {
    id: "5",
    type: "appointment",
    title: "Prescription Ready",
    message: "Dr. Robert Chen sent a new digital prescription for your allergy medication.",
    time: "3d ago",
    read: true,
  },
];

const getRelativeTime = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export default function NotificationsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = async () => {
    try {
      const response = await notificationApi.list();
      if (response.status === "success" && response.data) {
        const mapped = response.data.map((item: any) => ({
          id: item.id,
          type: item.type as any,
          title: item.title,
          message: item.body,
          time: getRelativeTime(item.createdAt),
          read: item.isRead,
        }));
        setNotifications(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await notificationApi.markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleToggleRead = async (id: string) => {
    try {
      const isCurrentlyUnread = !notifications.find((n) => n.id === id)?.read;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      if (isCurrentlyUnread) {
        await notificationApi.markAsRead(id);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await notificationApi.delete(id);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleClearAll = async () => {
    try {
      setNotifications([]);
      await notificationApi.clearAll();
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  const handleRestoreDefaults = () => {
    fetchNotifications();
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "ai":
        return (
          <View className="w-10 h-10 bg-primary-light dark:bg-primary-light-dark rounded-xl items-center justify-center">
            <Ionicons name="sparkles" size={20} color={isDark ? "#60A5FA" : "#1565C0"} />
          </View>
        );
      case "appointment":
        return (
          <View className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl items-center justify-center">
            <Ionicons name="calendar" size={20} color="#059669" />
          </View>
        );
      case "record":
        return (
          <View className="w-10 h-10 bg-amber-50 dark:bg-amber-950/30 rounded-xl items-center justify-center">
            <Ionicons name="document-text" size={20} color="#D97706" />
          </View>
        );
      case "reminder":
        return (
          <View className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl items-center justify-center">
            <Ionicons name="notifications" size={20} color="#4F46E5" />
          </View>
        );
      default:
        return (
          <View className="w-10 h-10 bg-background dark:bg-background-dark rounded-xl items-center justify-center">
            <Ionicons name="alert-circle" size={20} color={isDark ? "#94A3B8" : "#475569"} />
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-surface dark:bg-surface-dark border-b border-border-color dark:border-border-color-dark">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark mr-3"
          >
            <Ionicons name="chevron-back" size={22} color={isDark ? "#F8FAFC" : "#1E293B"} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text-main dark:text-text-main-dark">Notifications</Text>
        </View>

        {notifications.length > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className={`px-3 py-1.5 rounded-lg`}
            style={{ opacity: unreadCount === 0 ? 0.4 : 1 }}
          >
            <Text className="text-sm font-semibold text-primary">
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      {notifications.length > 0 && (
        <View className="flex-row px-6 py-3 bg-surface dark:bg-surface-dark border-b border-border-color dark:border-border-color-dark items-center justify-between">
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setFilter("all")}
              className={`px-4 py-2 rounded-full ${
                filter === "all" ? "bg-primary" : "bg-background dark:bg-background-dark"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  filter === "all" ? "text-white" : "text-text-muted dark:text-text-muted-dark"
                }`}
              >
                All ({notifications.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilter("unread")}
              className={`px-4 py-2 rounded-full ${
                filter === "unread" ? "bg-primary" : "bg-background dark:bg-background-dark"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  filter === "unread" ? "text-white" : "text-text-muted dark:text-text-muted-dark"
                }`}
              >
                Unread ({unreadCount})
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleClearAll} className="flex-row items-center py-1.5 px-3 rounded-xl bg-red-50/50 dark:bg-red-950/20">
            <Ionicons name="trash-outline" size={14} color="#EF4444" style={{ marginRight: 4 }} />
            <Text className="text-xs font-semibold text-red-500">Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
          <ActivityIndicator size="large" color="#1565C0" />
          <Text className="text-xs text-text-muted dark:text-text-muted-dark font-semibold mt-4">
            Loading notifications...
          </Text>
        </View>
      ) : filteredNotifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8 bg-background dark:bg-background-dark">
          <View className="w-20 h-20 bg-surface dark:bg-surface-dark rounded-3xl items-center justify-center mb-6 shadow-sm border border-border-color dark:border-border-color-dark">
            <Ionicons
              name={filter === "unread" ? "checkmark-circle-outline" : "notifications-off-outline"}
              size={40}
              color={filter === "unread" ? "#10B981" : (isDark ? "#64748B" : "#94A3B8")}
            />
          </View>
          <Text className="text-xl font-bold text-text-main dark:text-text-main-dark text-center mb-2">
            {filter === "unread"
              ? "All caught up!"
              : "No Notifications Yet"}
          </Text>
          <Text className="text-sm text-text-muted dark:text-text-muted-dark text-center leading-relaxed mb-8 max-w-xs">
            {filter === "unread"
              ? "You have read all your notifications. Good job!"
              : "We will notify you when something important regarding your health or appointments comes up."}
          </Text>

          <View className="w-full gap-3">
            {notifications.length === 0 && (
              <TouchableOpacity
                onPress={handleRestoreDefaults}
                className="w-full bg-primary-light dark:bg-primary-light-dark py-3.5 rounded-2xl items-center justify-center border border-border-color dark:border-border-color-dark"
              >
                <Text className="text-primary font-bold text-sm">
                  Refresh Notifications
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => router.back()}
              className="w-full bg-surface dark:bg-surface-dark py-3.5 rounded-2xl items-center justify-center border border-border-color dark:border-border-color-dark"
            >
              <Text className="text-text-main dark:text-text-main-dark font-bold text-sm">
                Go back to Home
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleToggleRead(item.id)}
              activeOpacity={0.9}
              className={`mb-4 flex-row p-4 rounded-2xl border ${
                item.read
                  ? "bg-surface dark:bg-surface-dark border-border-color dark:border-border-color-dark"
                  : "bg-surface dark:bg-surface-dark border-primary shadow-sm"
              }`}
              style={{
                backgroundColor: item.read ? (isDark ? "#1E293B" : "#ffffff") : (isDark ? "#0F172A" : "#F8FAFC"),
              }}
            >
              {/* Notification icon & optional unread dot */}
              <View className="mr-3 justify-center relative">
                {renderIcon(item.type)}
                {!item.read && (
                  <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-surface dark:border-border-color-dark" />
                )}
              </View>

              {/* Notification text details */}
              <View className="flex-1 pr-2 justify-center">
                <View className="flex-row justify-between items-center mb-1">
                  <Text
                    className={`text-sm ${
                      item.read ? "font-semibold text-text-muted dark:text-text-muted-dark" : "font-bold text-text-main dark:text-text-main-dark"
                    }`}
                  >
                    {item.title}
                  </Text>
                  <Text className="text-xs text-text-light dark:text-text-light-dark font-medium">
                    {item.time}
                  </Text>
                </View>
                <Text
                  className={`text-xs leading-relaxed ${
                    item.read ? "text-text-light dark:text-text-light-dark font-normal" : "text-text-muted dark:text-text-muted-dark font-medium"
                  }`}
                  numberOfLines={2}
                >
                  {item.message}
                </Text>
              </View>

              {/* Action: Delete */}
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                className="w-8 h-8 items-center justify-center rounded-full bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark self-center"
              >
                <Ionicons name="close" size={16} color={isDark ? "#94A3B8" : "#64748B"} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
