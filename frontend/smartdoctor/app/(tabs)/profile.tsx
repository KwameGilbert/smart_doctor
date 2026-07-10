import React, { useState } from "react";
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

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MedicalRecord {
  id: string;
  name: string;
  date: string;
  size: string;
  type: "pdf" | "image";
}

export default function ProfileScreen() {
  const [records, setRecords] = useState<MedicalRecord[]>([
    {
      id: "rec-1",
      name: "Blood_Test_Report.pdf",
      date: "July 02, 2026",
      size: "1.2 MB",
      type: "pdf",
    },
    {
      id: "rec-2",
      name: "Cardiology_Prescription.pdf",
      date: "Jan 22, 2025",
      size: "340 KB",
      type: "pdf",
    },
    {
      id: "rec-3",
      name: "Chest_XRay_Scan.png",
      date: "Nov 15, 2024",
      size: "4.5 MB",
      type: "image",
    },
  ]);

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
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-4">
        {/* User Card */}
        <View className="bg-white border border-slate-100 rounded-3xl p-5 mb-6 flex-row items-center">
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150" }}
            style={{ width: 68, height: 68, borderRadius: 22 }}
          />
          <View className="ml-4 flex-1">
            <Text className="text-lg font-bold text-slate-900">Elton John</Text>
            <Text className="text-xs text-slate-400 font-semibold mt-0.5">elton.john@gmail.com</Text>
            <Text className="text-xs text-[#1D4ED8] font-bold mt-1">+233 24 123 4567</Text>
          </View>
        </View>

        {/* Health Metrics Grid */}
        <View className="flex-row justify-between mb-6">
          <View className="w-[31%] bg-white border border-slate-100 p-3 rounded-2xl items-center">
            <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Blood</Text>
            <Text className="text-base font-extrabold text-red-500">O+</Text>
          </View>
          <View className="w-[31%] bg-white border border-slate-100 p-3 rounded-2xl items-center">
            <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Height</Text>
            <Text className="text-base font-extrabold text-slate-800">178 cm</Text>
          </View>
          <View className="w-[31%] bg-white border border-slate-100 p-3 rounded-2xl items-center">
            <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Weight</Text>
            <Text className="text-base font-extrabold text-slate-800">72 kg</Text>
          </View>
        </View>

        {/* Integrated Medical Records section */}
        <View className="bg-white border border-slate-100 rounded-3xl p-5 mb-6">
          <View className="flex-row justify-between items-center mb-4 pb-1">
            <View>
              <Text className="text-sm font-bold text-slate-900">Medical Records</Text>
              <Text className="text-[10px] text-slate-400 font-semibold mt-0.5">Prescriptions, labs & scans</Text>
            </View>
            <TouchableOpacity
              onPress={handleUploadDocument}
              className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl flex-row items-center"
            >
              <Ionicons name="cloud-upload" size={14} color="#1D4ED8" style={{ marginRight: 4 }} />
              <Text className="text-xs font-bold text-[#1D4ED8]">Upload</Text>
            </TouchableOpacity>
          </View>

          {records.length === 0 ? (
            <View className="items-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <Ionicons name="folder-open-outline" size={32} color="#94A3B8" className="mb-2" />
              <Text className="text-slate-400 text-xs font-bold">No documents uploaded yet.</Text>
            </View>
          ) : (
            records.map((rec) => (
              <View
                key={rec.id}
                className="flex-row items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl mb-3"
              >
                <View className="flex-row items-center flex-1 pr-3">
                  <View className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${
                    rec.type === "pdf" ? "bg-red-50" : "bg-blue-50"
                  }`}>
                    <Ionicons
                      name={rec.type === "pdf" ? "document-text" : "image"}
                      size={18}
                      color={rec.type === "pdf" ? "#EF4444" : "#3B82F6"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-slate-800" numberOfLines={1}>
                      {rec.name}
                    </Text>
                    <Text className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {rec.date} • {rec.size}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteRecord(rec.id, rec.name)}
                  className="w-8 h-8 items-center justify-center rounded-full bg-white border border-slate-100"
                >
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Settings Menu */}
        <View className="bg-white border border-slate-100 rounded-3xl p-5 mb-6">
          <Text className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Settings & Info</Text>
          
          {[
            { icon: "person-outline", title: "Edit Profile", subtitle: "Update details & credentials" },
            { icon: "notifications-outline", title: "Notifications", subtitle: "Manage alerts & reminders" },
            { icon: "shield-checkmark-outline", title: "Privacy & Security", subtitle: "Passwords & biometric login" },
            { icon: "help-circle-outline", title: "Help & Support", subtitle: "FAQs & customer service" },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center justify-between py-3 ${
                index !== 3 ? "border-b border-slate-100 mb-2" : ""
              }`}
            >
              <View className="flex-row items-center">
                <View className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl items-center justify-center mr-3">
                  <Ionicons name={item.icon as any} size={18} color="#64748B" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-800">{item.title}</Text>
                  <Text className="text-[10px] text-slate-400 font-semibold">{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={14} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          onPress={() => router.replace("/auth")}
          className="border border-red-100 bg-red-50/20 py-4 rounded-3xl items-center justify-center w-full mb-10"
        >
          <Text className="text-red-500 font-bold text-sm">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
