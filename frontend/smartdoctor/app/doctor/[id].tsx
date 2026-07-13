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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("About");

  const doctor = ALL_DOCTORS.find((d) => d.id === id) || ALL_DOCTORS[0];

  const handleTabPress = (tab: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
  };

  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Top Header Section */}
        <View className="bg-primary-light dark:bg-primary-light-dark pt-12 px-6 pb-6" style={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
          <SafeAreaView edges={["top"]} style={{ marginBottom: -30 }} />
          
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 items-center justify-center -ml-2 mb-4"
          >
            <Ionicons name="chevron-back" size={24} color={isDark ? "#F8FAFC" : "#1E293B"} />
          </TouchableOpacity>

          <View className="flex-row justify-between">
            <View className="flex-1 pr-4 mt-2">
              <Text className="text-2xl font-bold text-text-main dark:text-text-main-dark mb-2">
                {doctor.name}
              </Text>
              <Text className="text-sm font-bold text-primary">
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
            <View className="w-12 h-12 bg-primary-light dark:bg-primary-light-dark rounded-full items-center justify-center mb-2">
              <Ionicons name="briefcase-outline" size={20} color={isDark ? "#60A5FA" : "#3B82F6"} />
            </View>
            <Text className="text-sm font-bold text-text-main dark:text-text-main-dark">{doctor.experience}</Text>
            <Text className="text-xs text-text-muted dark:text-text-muted-dark">Experience</Text>
          </View>
          <View className="items-center">
            <View className="w-12 h-12 bg-primary-light dark:bg-primary-light-dark rounded-full items-center justify-center mb-2">
              <Ionicons name="people-outline" size={20} color={isDark ? "#60A5FA" : "#3B82F6"} />
            </View>
            <Text className="text-sm font-bold text-text-main dark:text-text-main-dark">{doctor.patients}</Text>
            <Text className="text-xs text-text-muted dark:text-text-muted-dark">Patients</Text>
          </View>
          <View className="items-center">
            <View className="w-12 h-12 bg-primary-light dark:bg-primary-light-dark rounded-full items-center justify-center mb-2">
              <Ionicons name="star-outline" size={20} color={isDark ? "#60A5FA" : "#3B82F6"} />
            </View>
            <Text className="text-sm font-bold text-text-main dark:text-text-main-dark">{doctor.rating}</Text>
            <Text className="text-xs text-text-muted dark:text-text-muted-dark">Rating</Text>
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
                className={`px-6 py-2.5 rounded-full border ${isActive ? 'bg-primary border-primary' : 'bg-surface dark:bg-surface-dark border-border-color dark:border-border-color-dark'}`}
              >
                <Text className={`text-sm font-bold ${isActive ? 'text-white' : 'text-text-main dark:text-text-main-dark'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Tab Content */}
        {activeTab === "About" && (
          <View className="px-6 animate-fade-in">
            <Text className="text-sm text-text-muted dark:text-text-muted-dark leading-relaxed mb-6">
              {doctor.about} <Text className="text-primary font-bold">More</Text>
            </Text>

            {/* Info Cards Grid */}
            <View className="flex-row flex-wrap justify-between">
              <View className="w-[48%] bg-background dark:bg-background-dark p-4 rounded-2xl mb-4">
                <Text className="text-xs text-text-muted dark:text-text-muted-dark mb-1">Doctor ID Code</Text>
                <Text className="text-sm font-bold text-text-main dark:text-text-main-dark">{doctor.doctorIdCode}</Text>
              </View>
              <View className="w-[48%] bg-background dark:bg-background-dark p-4 rounded-2xl mb-4">
                <Text className="text-xs text-text-muted dark:text-text-muted-dark mb-1">Avg Session Time</Text>
                <Text className="text-sm font-bold text-text-main dark:text-text-main-dark">{doctor.avgSessionTime}</Text>
              </View>
              <View className="w-[48%] bg-background dark:bg-background-dark p-4 rounded-2xl mb-4">
                <Text className="text-xs text-text-muted dark:text-text-muted-dark mb-1">Prescription Type</Text>
                <Text className="text-sm font-bold text-text-main dark:text-text-main-dark">{doctor.prescriptionType}</Text>
              </View>
              <View className="w-[48%] bg-background dark:bg-background-dark p-4 rounded-2xl mb-4">
                <Text className="text-xs text-text-muted dark:text-text-muted-dark mb-1">Contracts</Text>
                <Text className="text-sm font-bold text-text-main dark:text-text-main-dark">{doctor.contracts}</Text>
              </View>
            </View>

            {/* User Reviews Header */}
            <View className="flex-row justify-between items-center mt-4 mb-4">
              <Text className="text-base font-bold text-text-main dark:text-text-main-dark">User Reviews</Text>
              <TouchableOpacity onPress={() => handleTabPress("Reviews")} className="flex-row items-center">
                <Text className="text-xs font-bold text-primary mr-1">View More</Text>
                <Ionicons name="chevron-forward" size={12} color="#1D4ED8" />
              </TouchableOpacity>
            </View>

            {/* Review Cards */}
            {doctor.reviewsList.slice(0, 2).map((review) => (
              <View key={review.id} className="bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark rounded-3xl p-5 mb-4 shadow-sm shadow-slate-100/50">
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
                        color={star <= review.rating ? "#FBBF24" : (isDark ? "#334155" : "#E2E8F0")}
                        style={{ marginLeft: 2 }}
                      />
                    ))}
                  </View>
                </View>
                <Text className="text-sm text-text-muted dark:text-text-muted-dark leading-relaxed mb-4">
                  {review.text}
                </Text>
                <Text className="text-sm font-bold text-text-main dark:text-text-main-dark">
                  {review.name}
                </Text>
                <Text className="text-xs text-text-light dark:text-text-light-dark mt-1">
                  {review.date}
                </Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === "Reviews" && (
          <View className="px-6 animate-fade-in">
            {/* Reviews Summary Card */}
            <View className="bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark rounded-3xl p-5 mb-6 flex-row justify-between items-center">
              <View className="items-center justify-center w-[35%] border-r border-border-color dark:border-border-color-dark pr-4">
                <Text className="text-4xl font-extrabold text-text-main dark:text-text-main-dark">{doctor.rating}</Text>
                <View className="flex-row my-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star"
                      size={12}
                      color={star <= Math.round(doctor.rating) ? "#FBBF24" : (isDark ? "#334155" : "#E2E8F0")}
                      style={{ marginHorizontal: 1 }}
                    />
                  ))}
                </View>
                <Text className="text-[10px] text-text-muted dark:text-text-muted-dark font-bold">{doctor.reviews} Reviews</Text>
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
                    <Text className="text-[10px] text-text-muted dark:text-text-muted-dark font-bold w-3 mr-2">{row.star}</Text>
                    <View className="flex-1 h-1.5 bg-border-color dark:bg-border-color-dark rounded-full overflow-hidden">
                      <View className="h-full bg-[#FBBF24] rounded-full" style={{ width: row.pct as any }} />
                    </View>
                    <Text className="text-[9px] text-text-light dark:text-text-light-dark font-bold w-7 text-right ml-2">{row.pct}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Review Cards */}
            {doctor.reviewsList.map((review) => (
              <View key={review.id} className="bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark rounded-3xl p-5 mb-4 shadow-sm shadow-slate-100/50">
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
                        color={star <= review.rating ? "#FBBF24" : (isDark ? "#334155" : "#E2E8F0")}
                        style={{ marginLeft: 2 }}
                      />
                    ))}
                  </View>
                </View>
                <Text className="text-sm text-text-muted dark:text-text-muted-dark leading-relaxed mb-4">
                  {review.text}
                </Text>
                <Text className="text-sm font-bold text-text-main dark:text-text-main-dark">
                  {review.name}
                </Text>
                <Text className="text-xs text-text-light dark:text-text-light-dark mt-1">
                  {review.date}
                </Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === "Experience" && (
          <View className="px-6 animate-fade-in">
            {doctor.experienceList && doctor.experienceList.length > 0 ? (
              <View className="pl-4 border-l border-border-color dark:border-border-color-dark ml-2 py-1">
                {doctor.experienceList.map((exp, index) => (
                  <View key={index} className="mb-6 relative">
                    {/* Timeline dot */}
                    <View 
                      className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-surface dark:bg-surface-dark border-2 border-primary"
                      style={{ shadowColor: "#1D4ED8", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1 }}
                    />
                    
                    <Text className="text-[11px] font-bold text-primary mb-0.5">
                      {exp.period}
                    </Text>
                    <Text className="text-base font-bold text-text-main dark:text-text-main-dark mb-0.5">
                      {exp.role}
                    </Text>
                    <Text className="text-xs font-semibold text-text-muted dark:text-text-muted-dark mb-2">
                      {exp.hospital}
                    </Text>
                    <Text className="text-xs text-text-muted dark:text-text-muted-dark leading-relaxed">
                      {exp.description}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center py-10">
                <Ionicons name="briefcase-outline" size={48} color={isDark ? "#64748B" : "#94A3B8"} className="mb-2" />
                <Text className="text-text-muted dark:text-text-muted-dark text-sm">No experience details listed.</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "Education" && (
          <View className="px-6 animate-fade-in">
            {doctor.educationList && doctor.educationList.length > 0 ? (
              <View>
                {doctor.educationList.map((edu, index) => (
                  <View key={index} className="bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark rounded-3xl p-5 mb-4 flex-row items-center">
                    <View className="w-10 h-10 bg-primary-light dark:bg-primary-light-dark rounded-2xl items-center justify-center mr-4">
                      <Ionicons name="school" size={20} color={isDark ? "#F8FAFC" : "#1D4ED8"} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[10px] font-bold text-text-light dark:text-text-light-dark mb-0.5">
                        Graduated {edu.year}
                      </Text>
                      <Text className="text-sm font-bold text-text-main dark:text-text-main-dark mb-0.5 leading-snug">
                        {edu.degree}
                      </Text>
                      <Text className="text-xs font-semibold text-text-muted dark:text-text-muted-dark">
                        {edu.institution}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center py-10">
                <Ionicons name="school-outline" size={48} color={isDark ? "#64748B" : "#94A3B8"} className="mb-2" />
                <Text className="text-text-muted dark:text-text-muted-dark text-sm">No education details listed.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-surface dark:bg-surface-dark border-t border-border-color dark:border-border-color-dark pb-10">
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/(tabs)/appointments", params: { doctorId: doctor.id } })}
          className="bg-primary py-4 rounded-full items-center shadow-lg shadow-blue-500/30"
        >
          <Text className="text-white font-bold text-base">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
