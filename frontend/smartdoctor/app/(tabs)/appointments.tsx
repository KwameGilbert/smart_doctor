import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  UIManager,
  LayoutAnimation,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ALL_DOCTORS } from "../../constants/data";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Appointment {
  id: string;
  doctor: typeof ALL_DOCTORS[0];
  date: string;
  time: string;
  type: "Online Call" | "Clinic Visit";
  status: "Upcoming" | "Completed" | "Cancelled";
}

export default function AppointmentsScreen() {
  const params = useLocalSearchParams();
  const doctorId = params.doctorId as string;

  const [activeTab, setActiveTab] = useState<"Upcoming" | "Past">("Upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "apt-1",
      doctor: ALL_DOCTORS[0], // Dr. Rita Yeboah
      date: "July 15, 2026",
      time: "10:00 AM",
      type: "Online Call",
      status: "Upcoming",
    },
    {
      id: "apt-2",
      doctor: ALL_DOCTORS[1], // Dr. Samuel Mensah
      date: "July 22, 2026",
      time: "02:30 PM",
      type: "Clinic Visit",
      status: "Upcoming",
    },
    {
      id: "apt-3",
      doctor: ALL_DOCTORS[2], // Dr. Emma Watson
      date: "June 18, 2026",
      time: "11:15 AM",
      type: "Online Call",
      status: "Completed",
    },
  ]);

  // Scheduler flow states
  const [schedulerStep, setSchedulerStep] = useState<"booking" | "success" | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState("09:00 AM");
  const [consultationType, setConsultationType] = useState<"Online Call" | "Clinic Visit">("Online Call");

  // Rescheduling states
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [rescheduleDateIndex, setRescheduleDateIndex] = useState(0);
  const [rescheduleTime, setRescheduleTime] = useState("09:00 AM");

  const dates = React.useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      list.push({
        dayName: nextDay.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: nextDay.getDate(),
        month: nextDay.toLocaleDateString("en-US", { month: "short" }),
        fullString: nextDay.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      });
    }
    return list;
  }, []);

  const times = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "01:30 PM",
    "02:30 PM",
    "03:30 PM",
    "04:30 PM",
  ];

  // Monitor parameter changes for scheduling navigation
  useEffect(() => {
    if (doctorId) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSchedulerStep("booking");
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSchedulerStep(null);
    }
  }, [doctorId]);

  const handleTabPress = (tab: "Upcoming" | "Past") => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
  };

  const handleConfirmBooking = () => {
    const selectedDoctor = ALL_DOCTORS.find((d) => d.id === doctorId) || ALL_DOCTORS[0];
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      doctor: selectedDoctor,
      date: dates[selectedDateIndex].fullString,
      time: selectedTime,
      type: consultationType,
      status: "Upcoming",
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAppointments([newApt, ...appointments]);
    setSchedulerStep("success");
  };

  const handleCloseSuccess = () => {
    // Clear route parameters so scheduler doesn't re-trigger
    router.replace("/(tabs)/appointments");
    setSchedulerStep(null);
    setActiveTab("Upcoming");
  };

  const handleCancelAppointment = (id: string) => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setAppointments((prev) =>
              prev.map((apt) => (apt.id === id ? { ...apt, status: "Cancelled" } : apt))
            );
          },
        },
      ]
    );
  };

  const handleOpenReschedule = (apt: Appointment) => {
    setReschedulingAppointment(apt);
    setRescheduleDateIndex(0);
    setRescheduleTime(apt.time);
  };

  const handleSaveReschedule = () => {
    if (!reschedulingAppointment) return;
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === reschedulingAppointment.id
          ? {
              ...apt,
              date: dates[rescheduleDateIndex].fullString,
              time: rescheduleTime,
            }
          : apt
      )
    );
    setReschedulingAppointment(null);
  };

  const upcomingAppointments = appointments.filter((apt) => apt.status === "Upcoming");
  const pastAppointments = appointments.filter(
    (apt) => apt.status === "Completed" || apt.status === "Cancelled"
  );

  // If in scheduling subflow
  if (schedulerStep === "booking") {
    const selectedDoctor = ALL_DOCTORS.find((d) => d.id === doctorId) || ALL_DOCTORS[0];
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-100">
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/appointments")}
            className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100"
          >
            <Ionicons name="chevron-back" size={20} color="#1E293B" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-900">Schedule Session</Text>
          <View className="w-10" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Doctor Summary Card */}
          <View className="mx-6 mt-6 p-4 bg-[#EBF3FF] border border-blue-100 rounded-3xl flex-row items-center">
            <Image
              source={{ uri: selectedDoctor.image }}
              style={{ width: 64, height: 64, borderRadius: 16 }}
            />
            <View className="flex-1 ml-4">
              <Text className="text-base font-bold text-slate-900">{selectedDoctor.name}</Text>
              <Text className="text-xs text-[#1D4ED8] font-bold mt-0.5">{selectedDoctor.specialty}</Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="star" size={12} color="#FBBF24" />
                <Text className="text-xs font-bold text-slate-700 ml-1">{selectedDoctor.rating}</Text>
                <Text className="text-[10px] text-slate-400 ml-1">({selectedDoctor.reviews} reviews)</Text>
              </View>
            </View>
          </View>

          {/* Date Selector */}
          <View className="mt-8">
            <Text className="text-sm font-bold text-slate-900 px-6 mb-4">Select Date</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
            >
              {dates.map((d, index) => {
                const isSelected = selectedDateIndex === index;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedDateIndex(index)}
                    className={`w-16 py-3 rounded-2xl items-center justify-center border ${
                      isSelected
                        ? "bg-[#1D4ED8] border-[#1D4ED8]"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <Text className={`text-[10px] font-bold ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                      {d.dayName}
                    </Text>
                    <Text className={`text-lg font-extrabold mt-0.5 ${isSelected ? "text-white" : "text-slate-800"}`}>
                      {d.dayNum}
                    </Text>
                    <Text className={`text-[9px] font-bold mt-0.5 ${isSelected ? "text-blue-200" : "text-slate-400"}`}>
                      {d.month}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Time Selector */}
          <View className="mt-8">
            <Text className="text-sm font-bold text-slate-900 px-6 mb-4">Available Time Slots</Text>
            <View className="flex-row flex-wrap px-6 gap-3">
              {times.map((t) => {
                const isSelected = selectedTime === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setSelectedTime(t)}
                    style={{ width: "31%" }}
                    className={`py-3 rounded-2xl items-center justify-center border ${
                      isSelected
                        ? "bg-[#1D4ED8] border-[#1D4ED8]"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-700"}`}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Consultation Type Selector */}
          <View className="mt-8 px-6">
            <Text className="text-sm font-bold text-slate-900 mb-4">Consultation Type</Text>
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setConsultationType("Online Call")}
                className={`flex-1 p-4 rounded-3xl border flex-row items-center ${
                  consultationType === "Online Call"
                    ? "bg-blue-50 border-[#1D4ED8]"
                    : "bg-white border-slate-200"
                }`}
              >
                <View className={`w-8 h-8 rounded-xl items-center justify-center ${
                  consultationType === "Online Call" ? "bg-blue-500" : "bg-slate-100"
                }`}>
                  <Ionicons
                    name="videocam"
                    size={16}
                    color={consultationType === "Online Call" ? "#FFFFFF" : "#64748B"}
                  />
                </View>
                <View className="ml-3">
                  <Text className="text-xs font-bold text-slate-800">Online Call</Text>
                  <Text className="text-[10px] text-slate-400 font-semibold mt-0.5">Video/Audio</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setConsultationType("Clinic Visit")}
                className={`flex-1 p-4 rounded-3xl border flex-row items-center ${
                  consultationType === "Clinic Visit"
                    ? "bg-blue-50 border-[#1D4ED8]"
                    : "bg-white border-slate-200"
                }`}
              >
                <View className={`w-8 h-8 rounded-xl items-center justify-center ${
                  consultationType === "Clinic Visit" ? "bg-blue-500" : "bg-slate-100"
                }`}>
                  <Ionicons
                    name="business"
                    size={16}
                    color={consultationType === "Clinic Visit" ? "#FFFFFF" : "#64748B"}
                  />
                </View>
                <View className="ml-3">
                  <Text className="text-xs font-bold text-slate-800">Clinic Visit</Text>
                  <Text className="text-[10px] text-slate-400 font-semibold mt-0.5">In-Person</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Footer Confirm */}
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 pb-10">
          <TouchableOpacity
            onPress={handleConfirmBooking}
            className="bg-[#1D4ED8] py-4 rounded-full items-center shadow-lg shadow-blue-500/30"
          >
            <Text className="text-white font-bold text-base">Confirm Appointment</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If in Success screen
  if (schedulerStep === "success") {
    const selectedDoctor = ALL_DOCTORS.find((d) => d.id === doctorId) || ALL_DOCTORS[0];
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-8">
        <View className="w-20 h-20 bg-green-50 rounded-full items-center justify-center mb-6 border border-green-100">
          <Ionicons name="checkmark-circle" size={48} color="#10B981" />
        </View>
        <Text className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</Text>
        <Text className="text-sm text-slate-500 text-center mb-6 leading-relaxed px-4">
          Your session with <Text className="font-semibold text-slate-800">{selectedDoctor.name}</Text> has been successfully scheduled.
        </Text>
        
        <View className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 mb-8">
          <View className="flex-row justify-between mb-3 border-b border-slate-200/50 pb-3">
            <Text className="text-xs text-slate-400 font-bold">Consultant</Text>
            <Text className="text-xs text-slate-800 font-extrabold">{selectedDoctor.name}</Text>
          </View>
          <View className="flex-row justify-between mb-3 border-b border-slate-200/50 pb-3">
            <Text className="text-xs text-slate-400 font-bold">Date & Time</Text>
            <Text className="text-xs text-slate-800 font-extrabold">
              {dates[selectedDateIndex].fullString} at {selectedTime}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-slate-400 font-bold">Consultation Type</Text>
            <Text className="text-xs text-slate-800 font-extrabold">{consultationType}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleCloseSuccess}
          className="w-full bg-[#1D4ED8] py-4 rounded-full items-center shadow-lg shadow-blue-500/30"
        >
          <Text className="text-white font-bold text-base">View My Bookings</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // DEFAULT VIEW: List Bookings
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 pb-3 flex-row justify-between items-center bg-white border-b border-slate-100">
        <Text className="text-xl font-bold text-slate-900">Appointments</Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/home")}
          className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center"
        >
          <Ionicons name="add" size={20} color="#1D4ED8" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 bg-white pb-3 border-b border-slate-100">
        <TouchableOpacity
          onPress={() => handleTabPress("Upcoming")}
          className="flex-1 items-center py-2"
        >
          <Text className={`text-sm font-bold ${activeTab === "Upcoming" ? "text-[#1D4ED8]" : "text-slate-400"}`}>
            Upcoming ({upcomingAppointments.length})
          </Text>
          {activeTab === "Upcoming" && <View className="h-0.5 bg-[#1D4ED8] w-12 mt-2 rounded-full" />}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleTabPress("Past")}
          className="flex-1 items-center py-2"
        >
          <Text className={`text-sm font-bold ${activeTab === "Past" ? "text-[#1D4ED8]" : "text-slate-400"}`}>
            Past & Cancelled ({pastAppointments.length})
          </Text>
          {activeTab === "Past" && <View className="h-0.5 bg-[#1D4ED8] w-12 mt-2 rounded-full" />}
        </TouchableOpacity>
      </View>

      {/* Appointment Cards List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6 pt-5"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {activeTab === "Upcoming" ? (
          upcomingAppointments.length === 0 ? (
            <View className="items-center justify-center py-20">
              <View className="w-16 h-16 bg-white border border-slate-100 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="calendar-outline" size={32} color="#94A3B8" />
              </View>
              <Text className="text-base font-bold text-slate-800 text-center">
                No upcoming sessions
              </Text>
              <Text className="text-xs text-slate-400 mt-1 text-center px-4 leading-relaxed mb-6">
                You do not have any appointments scheduled. Start booking now.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/home")}
                className="bg-[#1D4ED8] px-6 py-3 rounded-full"
              >
                <Text className="text-white font-bold text-xs">Book a Session</Text>
              </TouchableOpacity>
            </View>
          ) : (
            upcomingAppointments.map((apt) => (
              <View
                key={apt.id}
                className="bg-white border border-slate-100 rounded-3xl p-5 mb-4 shadow-sm shadow-slate-100/50"
              >
                {/* Doctor details */}
                <View className="flex-row items-center border-b border-slate-100 pb-4 mb-4">
                  <Image
                    source={{ uri: apt.doctor.image }}
                    style={{ width: 48, height: 48, borderRadius: 12 }}
                  />
                  <View className="flex-1 ml-3.5">
                    <Text className="text-sm font-bold text-slate-800">{apt.doctor.name}</Text>
                    <Text className="text-xs text-slate-400 font-semibold mt-0.5">
                      {apt.doctor.specialty}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-xl flex-row items-center ${
                    apt.type === "Online Call" ? "bg-blue-50" : "bg-green-50"
                  }`}>
                    <Ionicons
                      name={apt.type === "Online Call" ? "videocam" : "business"}
                      size={10}
                      color={apt.type === "Online Call" ? "#1D4ED8" : "#10B981"}
                      style={{ marginRight: 4 }}
                    />
                    <Text className={`text-[10px] font-bold ${
                      apt.type === "Online Call" ? "text-blue-700" : "text-green-700"
                    }`}>
                      {apt.type}
                    </Text>
                  </View>
                </View>

                {/* Date & Time */}
                <View className="flex-row items-center mb-4 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                  <Ionicons name="time" size={14} color="#64748B" style={{ marginRight: 6 }} />
                  <Text className="text-xs text-slate-600 font-bold">
                    {apt.date} • {apt.time}
                  </Text>
                </View>

                {/* Actions */}
                <View className="flex-row justify-between gap-3">
                  <TouchableOpacity
                    onPress={() => handleCancelAppointment(apt.id)}
                    className="flex-1 py-2.5 rounded-2xl border border-slate-200 items-center bg-white"
                  >
                    <Text className="text-xs font-bold text-slate-500">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleOpenReschedule(apt)}
                    className="flex-1 py-2.5 rounded-2xl border border-slate-200 items-center bg-white"
                  >
                    <Text className="text-xs font-bold text-slate-500">Reschedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (apt.type === "Online Call") {
                        router.push(`/doctor-chat/${apt.doctor.id}` as any);
                      } else {
                        Alert.alert("Clinic Location", "Please visit the clinic location for your physical checkup.");
                      }
                    }}
                    className="flex-1 py-2.5 rounded-2xl bg-[#1D4ED8] items-center"
                  >
                    <Text className="text-white font-bold text-xs">
                      {apt.type === "Online Call" ? "Start Chat" : "Location"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        ) : (
          pastAppointments.length === 0 ? (
            <View className="items-center justify-center py-20">
              <View className="w-16 h-16 bg-white border border-slate-100 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="time-outline" size={32} color="#94A3B8" />
              </View>
              <Text className="text-base font-bold text-slate-800 text-center">
                No past sessions
              </Text>
              <Text className="text-xs text-slate-400 mt-1 text-center px-4 leading-relaxed">
                Your past completed or cancelled appointments will show up here.
              </Text>
            </View>
          ) : (
            pastAppointments.map((apt) => (
              <View
                key={apt.id}
                className="bg-white border border-slate-100 rounded-3xl p-5 mb-4 opacity-75"
              >
                {/* Doctor details */}
                <View className="flex-row items-center border-b border-slate-100 pb-4 mb-4">
                  <Image
                    source={{ uri: apt.doctor.image }}
                    style={{ width: 48, height: 48, borderRadius: 12 }}
                  />
                  <View className="flex-1 ml-3.5">
                    <Text className="text-sm font-bold text-slate-800">{apt.doctor.name}</Text>
                    <Text className="text-xs text-slate-400 font-semibold mt-0.5">
                      {apt.doctor.specialty}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-xl ${
                    apt.status === "Completed" ? "bg-green-50" : "bg-red-50"
                  }`}>
                    <Text className={`text-[10px] font-bold ${
                      apt.status === "Completed" ? "text-green-700" : "text-red-700"
                    }`}>
                      {apt.status}
                    </Text>
                  </View>
                </View>

                {/* Date & Time */}
                <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                  <Ionicons name="time" size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                  <Text className="text-xs text-slate-500 font-semibold">
                    {apt.date} • {apt.time}
                  </Text>
                </View>

                {/* Re-book / Review action */}
                <View className="flex-row justify-end gap-3 mt-4">
                  <TouchableOpacity
                    onPress={() => router.push(`/doctor/${apt.doctor.id}`)}
                    className="px-5 py-2.5 rounded-2xl bg-blue-50 border border-blue-100 items-center"
                  >
                    <Text className="text-[#1D4ED8] font-bold text-xs">Book Again</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        )}
      </ScrollView>

      {/* Reschedule Modal */}
      <Modal
        visible={reschedulingAppointment !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReschedulingAppointment(null)}
      >
        <View style={styles.modalOverlay}>
          <View className="bg-white rounded-t-[40px] px-6 pt-6 pb-10 w-full max-h-[85%] absolute bottom-0 shadow-2xl">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-bold text-slate-900">Reschedule Appointment</Text>
              <TouchableOpacity
                onPress={() => setReschedulingAppointment(null)}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {reschedulingAppointment && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center p-3 bg-slate-50 rounded-2xl mb-6">
                  <Image
                    source={{ uri: reschedulingAppointment.doctor.image }}
                    style={{ width: 44, height: 44, borderRadius: 10 }}
                  />
                  <View className="ml-3">
                    <Text className="text-sm font-bold text-slate-800">{reschedulingAppointment.doctor.name}</Text>
                    <Text className="text-xs text-slate-400 font-semibold">{reschedulingAppointment.doctor.specialty}</Text>
                  </View>
                </View>

                {/* Date Strip */}
                <Text className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Select New Date</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
                  className="mb-6"
                >
                  {dates.map((d, index) => {
                    const isSelected = rescheduleDateIndex === index;
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setRescheduleDateIndex(index)}
                        className={`w-14 py-2.5 rounded-2xl items-center border ${
                          isSelected ? "bg-[#1D4ED8] border-[#1D4ED8]" : "bg-white border-slate-200"
                        }`}
                      >
                        <Text className={`text-[9px] font-bold ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                          {d.dayName}
                        </Text>
                        <Text className={`text-base font-extrabold mt-0.5 ${isSelected ? "text-white" : "text-slate-800"}`}>
                          {d.dayNum}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Time Grid */}
                <Text className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Select New Time</Text>
                <View className="flex-row flex-wrap gap-2.5 mb-8">
                  {times.map((t) => {
                    const isSelected = rescheduleTime === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        onPress={() => setRescheduleTime(t)}
                        style={{ width: "31%" }}
                        className={`py-2.5 rounded-2xl items-center border ${
                          isSelected ? "bg-[#1D4ED8] border-[#1D4ED8]" : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <Text className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-700"}`}>
                          {t}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Action button */}
                <TouchableOpacity
                  onPress={handleSaveReschedule}
                  className="w-full bg-[#1D4ED8] py-4 rounded-full items-center shadow-lg shadow-blue-500/30"
                >
                  <Text className="text-white font-bold text-sm">Update Appointment</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
});
