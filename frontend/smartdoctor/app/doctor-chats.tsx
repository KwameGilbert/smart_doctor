import React, { useState, useEffect } from "react";
import { useColorScheme } from "nativewind";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  UIManager,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { consultationApi, ConsultationResponse } from "../services/api/consultation";
import { socketService } from "../services/api/socket";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const formatMessageTime = (dateString?: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export default function DoctorChatsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [chats, setChats] = useState<ConsultationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChats = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await consultationApi.listMyConsultations();
      if (response.status === "success" && response.data) {
        setChats(response.data);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChats();

    // Connect to WebSocket and subscribe to changes
    const setupSocket = async () => {
      await socketService.connect();
      
      socketService.on("new_message", () => {
        // Refresh chat list when a new message is received
        fetchChats(false);
      });
    };
    
    setupSocket();

    return () => {
      socketService.off("new_message");
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchChats(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-surface-dark" edges={["top"]}>
      {/* Header (WhatsApp style: White with dark slate text, search/more options) */}
      <View className="px-6 py-4 bg-surface dark:bg-surface-dark border-b border-border-color dark:border-border-color-dark flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 items-center justify-center rounded-full mr-2"
          >
            <Ionicons name="arrow-back" size={24} color={isDark ? "#25D366" : "#075E54"} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text-main dark:text-text-main-dark">Doctor Chats</Text>
        </View>
        <View className="flex-row gap-4">
          <TouchableOpacity>
            <Ionicons name="search" size={20} color={isDark ? "#94A3B8" : "#54656F"} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={20} color={isDark ? "#94A3B8" : "#54656F"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Conversations List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1565C0" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 bg-surface dark:bg-surface-dark"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {chats.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20 px-6">
              <Ionicons name="chatbubbles-outline" size={48} color={isDark ? "#475569" : "#94A3B8"} />
              <Text className="text-sm font-bold text-text-muted dark:text-text-muted-dark mt-4 text-center">
                No Active Chats
              </Text>
              <Text className="text-xs text-text-light dark:text-text-light-dark mt-1 text-center">
                Book an online consultation appointment to start a chat with a doctor.
              </Text>
            </View>
          ) : (
            chats.map((chat) => {
              const docName = `Dr. ${chat.doctorFirstName} ${chat.doctorLastName}`;
              return (
                <TouchableOpacity
                  key={chat.id}
                  onPress={() => router.push(`/doctor-chat/${chat.doctorId}` as any)}
                  activeOpacity={0.7}
                  className="flex-row items-center px-6 py-3.5 border-b border-border-color dark:border-border-color-dark"
                >
                  {/* Doctor Avatar */}
                  <View className="relative">
                    <Image
                      source={{ uri: chat.doctorAvatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=150" }}
                      style={{ width: 52, height: 52, borderRadius: 26 }}
                      contentFit="cover"
                    />
                  </View>

                  {/* Chat details */}
                  <View className="flex-1 ml-4 justify-center pr-1">
                    <View className="flex-row justify-between items-baseline">
                      <Text className="text-[15px] font-bold text-text-main dark:text-text-main-dark leading-snug">
                        {docName}
                      </Text>
                      <Text className={`text-[11px] ${chat.unreadCount > 0 ? "text-[#25D366] font-bold" : "text-text-light dark:text-text-light-dark"}`}>
                        {formatMessageTime(chat.lastMessage?.createdAt)}
                      </Text>
                    </View>
                    <Text className="text-[11px] text-primary mt-0.5 font-semibold">
                      {chat.doctorSpecialty || "General Doctor"}
                    </Text>
                    <Text
                      className={`text-sm mt-1 leading-snug ${
                        chat.unreadCount > 0 ? "text-text-main dark:text-text-main-dark font-semibold" : "text-text-muted dark:text-text-muted-dark font-normal"
                      }`}
                      numberOfLines={1}
                    >
                      {chat.lastMessage?.content || "No messages yet"}
                    </Text>
                  </View>

                  {/* Unread count badge */}
                  {chat.unreadCount > 0 && (
                    <View className="w-5 h-5 bg-[#25D366] rounded-full items-center justify-center ml-2">
                      <Text className="text-white text-[10px] font-bold">
                        {chat.unreadCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
