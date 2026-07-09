import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

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

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleRestoreDefaults = () => {
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "ai":
        return (
          <View className="w-10 h-10 bg-[#E6F4FE] rounded-xl items-center justify-center">
            <Ionicons name="sparkles" size={20} color="#1565C0" />
          </View>
        );
      case "appointment":
        return (
          <View className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center">
            <Ionicons name="calendar" size={20} color="#059669" />
          </View>
        );
      case "record":
        return (
          <View className="w-10 h-10 bg-amber-50 rounded-xl items-center justify-center">
            <Ionicons name="document-text" size={20} color="#D97706" />
          </View>
        );
      case "reminder":
        return (
          <View className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center">
            <Ionicons name="notifications" size={20} color="#4F46E5" />
          </View>
        );
      default:
        return (
          <View className="w-10 h-10 bg-slate-100 rounded-xl items-center justify-center">
            <Ionicons name="alert-circle" size={20} color="#475569" />
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100 mr-3"
          >
            <Ionicons name="chevron-back" size={22} color="#1E293B" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900">Notifications</Text>
        </View>

        {notifications.length > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className={`px-3 py-1.5 rounded-lg`}
            style={{ opacity: unreadCount === 0 ? 0.4 : 1 }}
          >
            <Text className="text-sm font-semibold text-[#1565C0]">
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      {notifications.length > 0 && (
        <View className="flex-row px-6 py-3 bg-white border-b border-slate-100 items-center justify-between">
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setFilter("all")}
              className={`px-4 py-2 rounded-full ${
                filter === "all" ? "bg-[#1565C0]" : "bg-slate-100"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  filter === "all" ? "text-white" : "text-slate-600"
                }`}
              >
                All ({notifications.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilter("unread")}
              className={`px-4 py-2 rounded-full ${
                filter === "unread" ? "bg-[#1565C0]" : "bg-slate-100"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  filter === "unread" ? "text-white" : "text-slate-600"
                }`}
              >
                Unread ({unreadCount})
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleClearAll} className="flex-row items-center py-1.5 px-3 rounded-xl bg-red-50/50">
            <Ionicons name="trash-outline" size={14} color="#EF4444" style={{ marginRight: 4 }} />
            <Text className="text-xs font-semibold text-red-500">Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {filteredNotifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8 bg-slate-50">
          <View className="w-20 h-20 bg-white rounded-3xl items-center justify-center mb-6 shadow-sm border border-slate-100">
            <Ionicons
              name={filter === "unread" ? "checkmark-circle-outline" : "notifications-off-outline"}
              size={40}
              color={filter === "unread" ? "#10B981" : "#94A3B8"}
            />
          </View>
          <Text className="text-xl font-bold text-slate-800 text-center mb-2">
            {filter === "unread"
              ? "All caught up!"
              : "No Notifications Yet"}
          </Text>
          <Text className="text-sm text-slate-500 text-center leading-relaxed mb-8 max-w-xs">
            {filter === "unread"
              ? "You have read all your notifications. Good job!"
              : "We will notify you when something important regarding your health or appointments comes up."}
          </Text>

          <View className="w-full gap-3">
            {notifications.length === 0 && (
              <TouchableOpacity
                onPress={handleRestoreDefaults}
                className="w-full bg-[#E6F4FE] py-3.5 rounded-2xl items-center justify-center border border-[#1565C0]/20"
              >
                <Text className="text-[#1565C0] font-bold text-sm">
                  Restore Mock Notifications
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => router.back()}
              className="w-full bg-white py-3.5 rounded-2xl items-center justify-center border border-slate-200"
            >
              <Text className="text-slate-700 font-bold text-sm">
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
                  ? "bg-white border-slate-100"
                  : "bg-white border-blue-100 shadow-sm"
              }`}
              style={{
                backgroundColor: item.read ? "#ffffff" : "#F8FAFC",
              }}
            >
              {/* Notification icon & optional unread dot */}
              <View className="mr-3 justify-center relative">
                {renderIcon(item.type)}
                {!item.read && (
                  <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                )}
              </View>

              {/* Notification text details */}
              <View className="flex-1 pr-2 justify-center">
                <View className="flex-row justify-between items-center mb-1">
                  <Text
                    className={`text-sm ${
                      item.read ? "font-semibold text-slate-700" : "font-bold text-slate-900"
                    }`}
                  >
                    {item.title}
                  </Text>
                  <Text className="text-xs text-slate-400 font-medium">
                    {item.time}
                  </Text>
                </View>
                <Text
                  className={`text-xs leading-relaxed ${
                    item.read ? "text-slate-400 font-normal" : "text-slate-600 font-medium"
                  }`}
                  numberOfLines={2}
                >
                  {item.message}
                </Text>
              </View>

              {/* Action: Delete */}
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                className="w-8 h-8 items-center justify-center rounded-full bg-slate-50 border border-slate-100 self-center"
              >
                <Ionicons name="close" size={16} color="#64748B" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
