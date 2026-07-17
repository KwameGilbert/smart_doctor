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

import { userApi } from "../services/api/user";

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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChats = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [chatsRes, userRes] = await Promise.all([
        consultationApi.listMyConsultations(),
        userApi.getProfile()
      ]);
      if (chatsRes.status === "success" && chatsRes.data) {
        setChats(chatsRes.data);
      }
      if (userRes.status === "success" && userRes.data) {
        setCurrentUser(userRes.data);
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
              const isDoctor = currentUser?.role === "DOCTOR";
              
              // If I am the doctor, my partner is the patient. If I am the patient, my partner is the doctor.
              const partnerId = isDoctor ? chat.patientId : chat.doctorId;
              const partnerName = isDoctor 
                ? `${chat.patientFirstName} ${chat.patientLastName}`
                : `Dr. ${chat.doctorFirstName} ${chat.doctorLastName}`;
              const partnerAvatar = isDoctor ? chat.patientAvatar : chat.doctorAvatar;

              return (
                <TouchableOpacity
                  key={chat.id}
                  onPress={() => router.push(`/doctor-chat/${partnerId}` as any)}
                  activeOpacity={0.7}
                  className="flex-row items-center px-6 py-3.5 border-b border-border-color dark:border-border-color-dark"
                >
                  {/* Partner Avatar */}
                  <View className="relative">
                    <Image
                      source={{ uri: partnerAvatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=150" }}
                      style={{ width: 50, height: 50, borderRadius: 25 }}
                      className="bg-slate-200 dark:bg-slate-800"
                      contentFit="cover"
                    />
                    {chat.unreadCount > 0 && (
                      <View className="absolute -top-1 -right-1 bg-green-500 w-4 h-4 rounded-full items-center justify-center border-2 border-surface dark:border-surface-dark">
                        <Text className="text-[9px] text-white font-bold">{chat.unreadCount}</Text>
                      </View>
                    )}
                  </View>

                  {/* Chat Content */}
                  <View className="flex-1 ml-4">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-base font-bold text-text-main dark:text-text-main-dark" numberOfLines={1}>
                        {partnerName}
                      </Text>
                      <Text className="text-xs text-text-light dark:text-text-light-dark">
                        {formatMessageTime(chat.lastMessage?.createdAt || chat.createdAt)}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      {chat.lastMessage && chat.lastMessage.senderId === currentUser?.id && (
                        <Ionicons 
                          name="checkmark-done" 
                          size={16} 
                          color={chat.lastMessage.status === "READ" ? "#3B82F6" : "#94A3B8"} 
                          style={{ marginRight: 4 }} 
                        />
                      )}
                      <Text 
                        className={`flex-1 text-sm ${chat.unreadCount > 0 ? "font-semibold text-text-main dark:text-text-main-dark" : "text-text-muted dark:text-text-muted-dark"}`}
                        numberOfLines={1}
                      >
                        {chat.lastMessage 
                          ? (chat.lastMessage.content || (chat.lastMessage.attachmentType ? `Sent a ${chat.lastMessage.attachmentType.toLowerCase()}` : "Sent a message"))
                          : `Started a consultation session`
                        }
                      </Text>
                    </View>
                  </View>
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
