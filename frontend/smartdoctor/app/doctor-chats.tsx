import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ALL_DOCTORS, DOCTOR_CHATS } from "../constants/data";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DoctorChatsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header (WhatsApp style: White with dark slate text, search/more options) */}
      <View className="px-6 py-4 bg-white border-b border-slate-100 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 items-center justify-center rounded-full mr-2"
          >
            <Ionicons name="arrow-back" size={24} color="#075E54" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-800">Doctor Chats</Text>
        </View>
        <View className="flex-row gap-4">
          <TouchableOpacity>
            <Ionicons name="search" size={20} color="#54656F" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={20} color="#54656F" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Conversations List (WhatsApp style) */}
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-white">
        {DOCTOR_CHATS.map((chat) => {
          const doc = ALL_DOCTORS.find((d) => d.id === chat.doctorId) || ALL_DOCTORS[0];
          return (
            <TouchableOpacity
              key={chat.id}
              onPress={() => router.push(`/doctor-chat/${doc.id}` as any)}
              activeOpacity={0.7}
              className="flex-row items-center px-6 py-3.5 border-b border-slate-100/70"
            >
              {/* Doctor Avatar with Online Status Indicator (Perfect WhatsApp circle) */}
              <View className="relative">
                <Image
                  source={{ uri: doc.image }}
                  style={{ width: 52, height: 52, borderRadius: 26 }}
                  contentFit="cover"
                />
                {chat.online && (
                  <View className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] rounded-full border-2 border-white" />
                )}
              </View>

              {/* Chat details */}
              <View className="flex-1 ml-4 justify-center pr-1">
                <View className="flex-row justify-between items-baseline">
                  <Text className="text-[15px] font-bold text-slate-800 leading-snug">
                    {doc.name}
                  </Text>
                  <Text className={`text-[11px] ${chat.unreadCount > 0 ? "text-[#25D366] font-bold" : "text-slate-400"}`}>
                    {chat.time}
                  </Text>
                </View>
                <Text className="text-[11px] text-[#075E54] font-semibold mt-0.5">
                  {doc.specialty}
                </Text>
                <Text
                  className={`text-sm mt-1 leading-snug ${
                    chat.unreadCount > 0 ? "text-slate-800 font-semibold" : "text-slate-500 font-normal"
                  }`}
                  numberOfLines={1}
                >
                  {chat.lastMessage}
                </Text>
              </View>

              {/* Unread count badge (WhatsApp Green) */}
              {chat.unreadCount > 0 && (
                <View className="w-5 h-5 bg-[#25D366] rounded-full items-center justify-center ml-2">
                  <Text className="text-white text-[10px] font-bold">
                    {chat.unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
