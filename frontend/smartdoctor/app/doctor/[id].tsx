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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TABS = ["About", "Reviews", "Experience", "Education"];

import { ALL_DOCTORS } from "../../constants/data";

export default function DoctorDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("About");

  const doctor = ALL_DOCTORS.find((d) => d.id === id) || ALL_DOCTORS[0];

  const handleTabPress = (tab: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Top Header Section */}
        <View className="bg-[#EBF3FF] pt-12 px-6 pb-6" style={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
          <SafeAreaView edges={["top"]} style={{ marginBottom: -30 }} />
          
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 items-center justify-center -ml-2 mb-4"
          >
            <Ionicons name="chevron-back" size={24} color="#1E293B" />
          </TouchableOpacity>

          <View className="flex-row justify-between">
            <View className="flex-1 pr-4 mt-2">
              <Text className="text-2xl font-bold text-slate-900 mb-2">
                {doctor.name}
              </Text>
              <Text className="text-sm font-bold text-[#1D4ED8]">
                {doctor.specialty}
              </Text>
            </View>
            <View className="items-center justify-end -mt-8">
              <Image
                source={{ uri: doctor.image }}
                style={{ width: 140, height: 160 }}
                contentFit="contain"
              />
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View className="flex-row justify-between px-8 py-6">
          <View className="items-center">
            <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mb-2">
              <Ionicons name="briefcase-outline" size={20} color="#3B82F6" />
            </View>
            <Text className="text-sm font-bold text-slate-800">{doctor.experience}</Text>
            <Text className="text-xs text-slate-500">Experience</Text>
          </View>
          <View className="items-center">
            <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mb-2">
              <Ionicons name="people-outline" size={20} color="#3B82F6" />
            </View>
            <Text className="text-sm font-bold text-slate-800">{doctor.patients}</Text>
            <Text className="text-xs text-slate-500">Patients</Text>
          </View>
          <View className="items-center">
            <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mb-2">
              <Ionicons name="star-outline" size={20} color="#3B82F6" />
            </View>
            <Text className="text-sm font-bold text-slate-800">{doctor.rating}</Text>
            <Text className="text-xs text-slate-500">Rating</Text>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="px-6 mb-6"
          contentContainerStyle={{ gap: 12, paddingRight: 40 }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => handleTabPress(tab)}
                className={`px-6 py-2.5 rounded-full border ${isActive ? 'bg-[#1D4ED8] border-[#1D4ED8]' : 'bg-white border-slate-200'}`}
              >
                <Text className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-700'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Tab Content */}
        {activeTab === "About" && (
          <View className="px-6 animate-fade-in">
            <Text className="text-sm text-slate-600 leading-relaxed mb-6">
              {doctor.about} <Text className="text-[#1D4ED8] font-bold">More</Text>
            </Text>

            {/* Info Cards Grid */}
            <View className="flex-row flex-wrap justify-between">
              <View className="w-[48%] bg-[#F1F5F9] p-4 rounded-2xl mb-4">
                <Text className="text-xs text-slate-500 mb-1">Doctor ID Code</Text>
                <Text className="text-sm font-bold text-slate-800">{doctor.doctorIdCode}</Text>
              </View>
              <View className="w-[48%] bg-[#F1F5F9] p-4 rounded-2xl mb-4">
                <Text className="text-xs text-slate-500 mb-1">Avg Session Time</Text>
                <Text className="text-sm font-bold text-slate-800">{doctor.avgSessionTime}</Text>
              </View>
              <View className="w-[48%] bg-[#F1F5F9] p-4 rounded-2xl mb-4">
                <Text className="text-xs text-slate-500 mb-1">Prescription Type</Text>
                <Text className="text-sm font-bold text-slate-800">{doctor.prescriptionType}</Text>
              </View>
              <View className="w-[48%] bg-[#F1F5F9] p-4 rounded-2xl mb-4">
                <Text className="text-xs text-slate-500 mb-1">Contracts</Text>
                <Text className="text-sm font-bold text-slate-800">{doctor.contracts}</Text>
              </View>
            </View>

            {/* User Reviews Header */}
            <View className="flex-row justify-between items-center mt-4 mb-4">
              <Text className="text-base font-bold text-slate-900">User Reviews</Text>
              <TouchableOpacity onPress={() => handleTabPress("Reviews")} className="flex-row items-center">
                <Text className="text-xs font-bold text-[#1D4ED8] mr-1">View More</Text>
                <Ionicons name="chevron-forward" size={12} color="#1D4ED8" />
              </TouchableOpacity>
            </View>

            {/* Review Cards */}
            {doctor.reviewsList.slice(0, 2).map((review) => (
              <View key={review.id} className="bg-white border border-slate-100 rounded-3xl p-5 mb-4 shadow-sm shadow-slate-100/50">
                <View className="flex-row justify-between items-start mb-3">
                  <Image
                    source={{ uri: review.image }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
                  <View className="flex-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name="star"
                        size={14}
                        color={star <= review.rating ? "#FBBF24" : "#E2E8F0"}
                        style={{ marginLeft: 2 }}
                      />
                    ))}
                  </View>
                </View>
                <Text className="text-sm text-slate-700 leading-relaxed mb-4">
                  {review.text}
                </Text>
                <Text className="text-sm font-bold text-slate-900">
                  {review.name}
                </Text>
                <Text className="text-xs text-slate-400 mt-1">
                  {review.date}
                </Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === "Reviews" && (
          <View className="px-6 animate-fade-in">
            {/* Reviews Summary Card */}
            <View className="bg-slate-50 border border-slate-100 rounded-3xl p-5 mb-6 flex-row justify-between items-center">
              <View className="items-center justify-center w-[35%] border-r border-slate-200 pr-4">
                <Text className="text-4xl font-extrabold text-slate-900">{doctor.rating}</Text>
                <View className="flex-row my-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star"
                      size={12}
                      color={star <= Math.round(doctor.rating) ? "#FBBF24" : "#E2E8F0"}
                      style={{ marginHorizontal: 1 }}
                    />
                  ))}
                </View>
                <Text className="text-[10px] text-slate-500 font-bold">{doctor.reviews} Reviews</Text>
              </View>

              <View className="w-[60%] pl-2">
                {[
                  { star: 5, pct: "85%" },
                  { star: 4, pct: "10%" },
                  { star: 3, pct: "3%" },
                  { star: 2, pct: "1%" },
                  { star: 1, pct: "1%" },
                ].map((row) => (
                  <View key={row.star} className="flex-row items-center mb-1">
                    <Text className="text-[10px] text-slate-500 font-bold w-3 mr-2">{row.star}</Text>
                    <View className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <View className="h-full bg-[#FBBF24] rounded-full" style={{ width: row.pct as any }} />
                    </View>
                    <Text className="text-[9px] text-slate-400 font-bold w-7 text-right ml-2">{row.pct}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Review Cards */}
            {doctor.reviewsList.map((review) => (
              <View key={review.id} className="bg-white border border-slate-100 rounded-3xl p-5 mb-4 shadow-sm shadow-slate-100/50">
                <View className="flex-row justify-between items-start mb-3">
                  <Image
                    source={{ uri: review.image }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
                  <View className="flex-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name="star"
                        size={14}
                        color={star <= review.rating ? "#FBBF24" : "#E2E8F0"}
                        style={{ marginLeft: 2 }}
                      />
                    ))}
                  </View>
                </View>
                <Text className="text-sm text-slate-700 leading-relaxed mb-4">
                  {review.text}
                </Text>
                <Text className="text-sm font-bold text-slate-900">
                  {review.name}
                </Text>
                <Text className="text-xs text-slate-400 mt-1">
                  {review.date}
                </Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === "Experience" && (
          <View className="px-6 animate-fade-in">
            {doctor.experienceList && doctor.experienceList.length > 0 ? (
              <View className="pl-4 border-l border-blue-100 ml-2 py-1">
                {doctor.experienceList.map((exp, index) => (
                  <View key={index} className="mb-6 relative">
                    {/* Timeline dot */}
                    <View 
                      className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-white border-2 border-[#1D4ED8]"
                      style={{ shadowColor: "#1D4ED8", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1 }}
                    />
                    
                    <Text className="text-[11px] font-bold text-[#1D4ED8] mb-0.5">
                      {exp.period}
                    </Text>
                    <Text className="text-base font-bold text-slate-900 mb-0.5">
                      {exp.role}
                    </Text>
                    <Text className="text-xs font-semibold text-slate-500 mb-2">
                      {exp.hospital}
                    </Text>
                    <Text className="text-xs text-slate-600 leading-relaxed">
                      {exp.description}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center py-10">
                <Ionicons name="briefcase-outline" size={48} color="#94A3B8" className="mb-2" />
                <Text className="text-slate-500 text-sm">No experience details listed.</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "Education" && (
          <View className="px-6 animate-fade-in">
            {doctor.educationList && doctor.educationList.length > 0 ? (
              <View>
                {doctor.educationList.map((edu, index) => (
                  <View key={index} className="bg-slate-50 border border-slate-100 rounded-3xl p-5 mb-4 flex-row items-center">
                    <View className="w-10 h-10 bg-blue-50 rounded-2xl items-center justify-center mr-4">
                      <Ionicons name="school" size={20} color="#1D4ED8" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[10px] font-bold text-slate-400 mb-0.5">
                        Graduated {edu.year}
                      </Text>
                      <Text className="text-sm font-bold text-slate-900 mb-0.5 leading-snug">
                        {edu.degree}
                      </Text>
                      <Text className="text-xs font-semibold text-slate-500">
                        {edu.institution}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center py-10">
                <Ionicons name="school-outline" size={48} color="#94A3B8" className="mb-2" />
                <Text className="text-slate-500 text-sm">No education details listed.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 pb-10">
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/(tabs)/appointments", params: { doctorId: doctor.id } })}
          className="bg-[#1D4ED8] py-4 rounded-full items-center shadow-lg shadow-blue-500/30"
        >
          <Text className="text-white font-bold text-base">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
