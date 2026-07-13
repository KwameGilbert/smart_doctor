import React, { useState } from "react";
import { useColorScheme } from "nativewind";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  UIManager,
  LayoutAnimation,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { DUMMY_MEDICAL_RECORDS, MedicalRecord } from "../../constants/data";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProfileScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [records, setRecords] = useState<MedicalRecord[]>(DUMMY_MEDICAL_RECORDS);

  const handleUploadDocument = () => {
    const mockNames = [
      "Vaccination_Card.pdf",
      "Dental_Clinic_Receipt.pdf",
      "Eye_Test_Prescription.pdf",
      "MRI_Brain_Scan.png",
      "Urine_Analysis_Report.pdf",
    ];
    const mockTypes: ("pdf" | "image")[] = ["pdf", "pdf", "pdf", "image", "pdf"];
    const randomIndex = Math.floor(Math.random() * mockNames.length);

    const newRecord: MedicalRecord = {
      id: `rec-${Date.now()}`,
      name: mockNames[randomIndex],
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      type: mockTypes[randomIndex],
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRecords([newRecord, ...records]);
    Alert.alert("Upload Success", `"${newRecord.name}" has been uploaded to your profile.`);
  };

  const handleDeleteRecord = (id: string, name: string) => {
    Alert.alert(
      "Delete Document",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setRecords((prev) => prev.filter((r) => r.id !== id));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-4">
        {/* User Card */}
        <View className="bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark rounded-3xl p-5 mb-6 flex-row items-center">
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150" }}
            style={{ width: 68, height: 68, borderRadius: 22 }}
          />
          <View className="ml-4 flex-1">
            <Text className="text-lg font-bold text-text-main dark:text-text-main-dark">Elton John</Text>
            <Text className="text-xs text-text-light dark:text-text-light-dark font-semibold mt-0.5">elton.john@gmail.com</Text>
            <Text className="text-xs text-primary font-bold mt-1">+233 24 123 4567</Text>
          </View>
        </View>

        {/* Health Metrics Grid */}
        <View className="flex-row justify-between mb-6">
          <View className="w-[31%] bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark p-3 rounded-2xl items-center">
            <Text className="text-[10px] text-text-light dark:text-text-light-dark font-bold uppercase tracking-wider mb-1">Blood</Text>
            <Text className="text-base font-extrabold text-red-500 dark:text-red-400">O+</Text>
          </View>
          <View className="w-[31%] bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark p-3 rounded-2xl items-center">
            <Text className="text-[10px] text-text-light dark:text-text-light-dark font-bold uppercase tracking-wider mb-1">Height</Text>
            <Text className="text-base font-extrabold text-text-main dark:text-text-main-dark">178 cm</Text>
          </View>
          <View className="w-[31%] bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark p-3 rounded-2xl items-center">
            <Text className="text-[10px] text-text-light dark:text-text-light-dark font-bold uppercase tracking-wider mb-1">Weight</Text>
            <Text className="text-base font-extrabold text-text-main dark:text-text-main-dark">72 kg</Text>
          </View>
        </View>

        {/* Integrated Medical Records section */}
        <View className="bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark rounded-3xl p-5 mb-6">
          <View className="flex-row justify-between items-center mb-4 pb-1">
            <View>
              <Text className="text-sm font-bold text-text-main dark:text-text-main-dark">Medical Records</Text>
              <Text className="text-[10px] text-text-light dark:text-text-light-dark font-semibold mt-0.5">Prescriptions, labs & scans</Text>
            </View>
            <TouchableOpacity
              onPress={handleUploadDocument}
              className="px-4 py-2 bg-primary-light dark:bg-primary-light-dark border border-border-color dark:border-border-color-dark rounded-2xl flex-row items-center"
            >
              <Ionicons name="cloud-upload" size={14} color={isDark ? "#F8FAFC" : "#1D4ED8"} style={{ marginRight: 4 }} />
              <Text className="text-xs font-bold text-primary">Upload</Text>
            </TouchableOpacity>
          </View>

          {records.length === 0 ? (
            <View className="items-center py-6 bg-background dark:bg-background-dark border border-dashed border-border-color dark:border-border-color-dark rounded-2xl">
              <Ionicons name="folder-open-outline" size={32} color={isDark ? "#64748B" : "#94A3B8"} className="mb-2" />
              <Text className="text-text-light dark:text-text-light-dark text-xs font-bold">No documents uploaded yet.</Text>
            </View>
          ) : (
            records.map((rec) => (
              <View
                key={rec.id}
                className="flex-row items-center justify-between p-3 bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark rounded-2xl mb-3"
              >
                <View className="flex-row items-center flex-1 pr-3">
                  <View className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${
                    rec.type === "pdf" ? "bg-red-50 dark:bg-red-950/30" : "bg-primary-light dark:bg-primary-light-dark"
                  }`}>
                    <Ionicons
                      name={rec.type === "pdf" ? "document-text" : "image"}
                      size={18}
                      color={rec.type === "pdf" ? "#EF4444" : "#3B82F6"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-text-main dark:text-text-main-dark" numberOfLines={1}>
                      {rec.name}
                    </Text>
                    <Text className="text-[10px] text-text-light dark:text-text-light-dark font-semibold mt-0.5">
                      {rec.date} • {rec.size}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteRecord(rec.id, rec.name)}
                  className="w-8 h-8 items-center justify-center rounded-full bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark"
                >
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Settings Menu */}
        <View className="bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark rounded-3xl p-5 mb-6">
          <Text className="text-xs font-bold text-text-light dark:text-text-light-dark mb-4 uppercase tracking-wider">Settings & Info</Text>
          
          {[
            { icon: "person-outline", title: "Edit Profile", subtitle: "Update details & credentials" },
            { icon: "notifications-outline", title: "Notifications", subtitle: "Manage alerts & reminders" },
            { icon: "shield-checkmark-outline", title: "Privacy & Security", subtitle: "Passwords & biometric login" },
            { icon: "help-circle-outline", title: "Help & Support", subtitle: "FAQs & customer service" },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center justify-between py-3 ${
                index !== 3 ? "border-b border-border-color dark:border-border-color-dark mb-2" : ""
              }`}
            >
              <View className="flex-row items-center">
                <View className="w-9 h-9 bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark rounded-xl items-center justify-center mr-3">
                  <Ionicons name={item.icon as any} size={18} color={isDark ? "#94A3B8" : "#64748B"} />
                </View>
                <View>
                  <Text className="text-sm font-bold text-text-main dark:text-text-main-dark">{item.title}</Text>
                  <Text className="text-[10px] text-text-light dark:text-text-light-dark font-semibold">{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={14} color={isDark ? "#475569" : "#CBD5E1"} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          onPress={() => router.replace("/auth")}
          className="border border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/20 py-4 rounded-3xl items-center justify-center w-full mb-10"
        >
          <Text className="text-red-500 font-bold text-sm">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
