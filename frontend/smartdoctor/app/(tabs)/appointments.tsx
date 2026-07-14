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
  LayoutAnimation,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ALL_DOCTORS } from "../../constants/data";
import { appointmentApi } from "../../services/api/appointment";
import { useAlert } from "../../components/ui/AlertModal";
import BottomSheet from "../../components/ui/BottomSheet";

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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { showAlert } = useAlert();

  const params = useLocalSearchParams();
  const doctorId = params.doctorId as string;

  const [activeTab, setActiveTab] = useState<"Upcoming" | "Past">("Upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingList, setLoadingList] = useState(true);

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

  const fetchAppointments = async () => {
    try {
      setLoadingList(true);
      const response = await appointmentApi.list();
      if (response.status === "success" && response.data) {
        const mapped = response.data.map((apt: any) => {
          const docId = apt.doctorId;
          let doctor = ALL_DOCTORS.find((d) => d.id === docId);
          if (!doctor) {
            doctor = {
              id: docId,
              name: apt.doctorFirstName ? `Dr. ${apt.doctorFirstName} ${apt.doctorLastName}` : "Unknown Doctor",
              image: apt.doctorAvatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200",
              specialty: "General Medicine",
              rating: 4.5,
              reviews: 0,
            } as any;
          }

          const dateObj = new Date(apt.dateTime);
          const formattedDate = dateObj.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });
          const formattedTime = dateObj.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const parts = (apt.reason || "").split("|");
          const type = (parts[0] === "Online Call" || parts[0] === "Clinic Visit") ? parts[0] : "Online Call";

          let status: "Upcoming" | "Completed" | "Cancelled" = "Upcoming";
          if (apt.status === "COMPLETED") {
            status = "Completed";
          } else if (apt.status === "CANCELLED" || apt.status === "REJECTED") {
            status = "Cancelled";
          }

          return {
            id: apt.id,
            doctor,
            date: formattedDate,
            time: formattedTime,
            type,
            status,
          };
        });
        setAppointments(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (!schedulerStep) {
      fetchAppointments();
    }
  }, [schedulerStep]);

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

  const handleConfirmBooking = async () => {
    try {
      const dateString = dates[selectedDateIndex].fullString;
      const timeString = selectedTime;
      const dateTime = new Date(`${dateString} ${timeString}`).toISOString();
      const reason = `${consultationType}|Routine checkup`;

      const response = await appointmentApi.create({
        doctorId,
        dateTime,
        reason,
      });

      if (response.status === "success" || response.status === "created" || response.data) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSchedulerStep("success");
      } else {
        showAlert("Booking Failed", response.message || "Failed to confirm appointment booking.");
      }
    } catch (error: any) {
      console.error("Failed to book appointment:", error);
      const serverMessage = error.response?.data?.message || "Failed to book appointment. Please try again.";
      showAlert("Booking Error", serverMessage);
    }
  };

  const handleCloseSuccess = () => {
    // Clear route parameters so scheduler doesn't re-trigger
    router.replace("/(tabs)/appointments");
    setSchedulerStep(null);
    setActiveTab("Upcoming");
  };

  const handleCancelAppointment = (id: string) => {
    showAlert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await appointmentApi.cancel(id);
              if (response.status === "success") {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                fetchAppointments();
              } else {
                showAlert("Cancellation Failed", response.message || "Failed to cancel appointment.");
              }
            } catch (error: any) {
              console.error("Failed to cancel appointment:", error);
              const serverMessage = error.response?.data?.message || "Failed to cancel. Please try again.";
              showAlert("Cancellation Error", serverMessage);
            }
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

  const handleSaveReschedule = async () => {
    if (!reschedulingAppointment) return;
    
    try {
      const dateString = dates[rescheduleDateIndex].fullString;
      const timeString = rescheduleTime;

      const response = await appointmentApi.reschedule(reschedulingAppointment.id, {
        date: dateString,
        time: timeString,
      });

      if (response.status === "success") {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setReschedulingAppointment(null);
        fetchAppointments();
      } else {
        showAlert("Reschedule Failed", response.message || "Failed to reschedule appointment.");
      }
    } catch (error: any) {
      console.error("Failed to reschedule appointment:", error);
      const serverMessage = error.response?.data?.message || "Failed to reschedule. Please try again.";
      showAlert("Reschedule Error", serverMessage);
    }
  };

  const upcomingAppointments = appointments.filter((apt) => apt.status === "Upcoming");
  const pastAppointments = appointments.filter(
    (apt) => apt.status === "Completed" || apt.status === "Cancelled"
  );

  // If in scheduling subflow
  if (schedulerStep === "booking") {
    const selectedDoctor = ALL_DOCTORS.find((d) => d.id === doctorId) || ALL_DOCTORS[0];
    return (
      <SafeAreaView className="flex-1 bg-surface dark:bg-surface-dark" edges={["top"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-border-color dark:border-border-color-dark">
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/appointments")}
            className="w-10 h-10 items-center justify-center rounded-full bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark"
          >
            <Ionicons name="chevron-back" size={20} color={isDark ? "#F8FAFC" : "#1E293B"} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-text-main dark:text-text-main-dark">Schedule Session</Text>
          <View className="w-10" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Doctor Summary Card */}
          <View className="mx-6 mt-6 p-4 bg-primary-light dark:bg-primary-light-dark border border-border-color dark:border-border-color-dark rounded-3xl flex-row items-center">
            <Image
              source={{ uri: selectedDoctor.image }}
              style={{ width: 64, height: 64, borderRadius: 16 }}
            />
            <View className="flex-1 ml-4">
              <Text className="text-base font-bold text-text-main dark:text-text-main-dark">{selectedDoctor.name}</Text>
              <Text className="text-xs text-primary font-bold mt-0.5">{selectedDoctor.specialty}</Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="star" size={12} color="#FBBF24" />
                <Text className="text-xs font-bold text-text-muted dark:text-text-muted-dark ml-1">{selectedDoctor.rating}</Text>
                <Text className="text-[10px] text-text-light dark:text-text-light-dark ml-1">({selectedDoctor.reviews} reviews)</Text>
              </View>
            </View>
          </View>

          {/* Date Selector */}
          <View className="mt-8">
            <Text className="text-sm font-bold text-text-main dark:text-text-main-dark px-6 mb-4">Select Date</Text>
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
                        ? "bg-primary border-primary"
                        : "bg-surface dark:bg-surface-dark border-border-color dark:border-border-color-dark"
                    }`}
                  >
                    <Text className={`text-[10px] font-bold ${isSelected ? "text-blue-100" : "text-text-light dark:text-text-light-dark"}`}>
                      {d.dayName}
                    </Text>
                    <Text className={`text-lg font-extrabold mt-0.5 ${isSelected ? "text-white" : "text-text-main dark:text-text-main-dark"}`}>
                      {d.dayNum}
                    </Text>
                    <Text className={`text-[9px] font-bold mt-0.5 ${isSelected ? "text-blue-200" : "text-text-light dark:text-text-light-dark"}`}>
                      {d.month}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Time Selector */}
          <View className="mt-8">
            <Text className="text-sm font-bold text-text-main dark:text-text-main-dark px-6 mb-4">Available Time Slots</Text>
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
                        ? "bg-primary border-primary"
                        : "bg-background dark:bg-background-dark border-border-color dark:border-border-color-dark"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${isSelected ? "text-white" : "text-text-main dark:text-text-main-dark"}`}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Consultation Type Selector */}
          <View className="mt-8 px-6">
            <Text className="text-sm font-bold text-text-main dark:text-text-main-dark mb-4">Consultation Type</Text>
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setConsultationType("Online Call")}
                className={`flex-1 p-4 rounded-3xl border flex-row items-center ${
                  consultationType === "Online Call"
                    ? "bg-primary-light dark:bg-primary-light-dark border-primary"
                    : "bg-surface dark:bg-surface-dark border-border-color dark:border-border-color-dark"
                }`}
              >
                <View className={`w-8 h-8 rounded-xl items-center justify-center ${
                  consultationType === "Online Call" ? "bg-primary" : "bg-background dark:bg-background-dark"
                }`}>
                  <Ionicons
                    name="videocam"
                    size={16}
                    color={consultationType === "Online Call" ? "#FFFFFF" : (isDark ? "#94A3B8" : "#64748B")}
                  />
                </View>
                <View className="ml-3">
                  <Text className="text-xs font-bold text-text-main dark:text-text-main-dark">Online Call</Text>
                  <Text className="text-[10px] text-text-light dark:text-text-light-dark font-semibold mt-0.5">Video/Audio</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setConsultationType("Clinic Visit")}
                className={`flex-1 p-4 rounded-3xl border flex-row items-center ${
                  consultationType === "Clinic Visit"
                    ? "bg-primary-light dark:bg-primary-light-dark border-primary"
                    : "bg-surface dark:bg-surface-dark border-border-color dark:border-border-color-dark"
                }`}
              >
                <View className={`w-8 h-8 rounded-xl items-center justify-center ${
                  consultationType === "Clinic Visit" ? "bg-primary" : "bg-background dark:bg-background-dark"
                }`}>
                  <Ionicons
                    name="business"
                    size={16}
                    color={consultationType === "Clinic Visit" ? "#FFFFFF" : (isDark ? "#94A3B8" : "#64748B")}
                  />
                </View>
                <View className="ml-3">
                  <Text className="text-xs font-bold text-text-main dark:text-text-main-dark">Clinic Visit</Text>
                  <Text className="text-[10px] text-text-light dark:text-text-light-dark font-semibold mt-0.5">In-Person</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Footer Confirm */}
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-surface dark:bg-surface-dark border-t border-border-color dark:border-border-color-dark pb-10">
          <TouchableOpacity
            onPress={handleConfirmBooking}
            className="bg-primary py-4 rounded-full items-center shadow-lg shadow-blue-500/30"
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
      <SafeAreaView className="flex-1 bg-surface dark:bg-surface-dark items-center justify-center p-8">
        <View className="w-20 h-20 bg-green-50 dark:bg-green-950/30 rounded-full items-center justify-center mb-6 border border-green-100 dark:border-green-900/50">
          <Ionicons name="checkmark-circle" size={48} color="#10B981" />
        </View>
        <Text className="text-2xl font-bold text-text-main dark:text-text-main-dark mb-2">Booking Confirmed!</Text>
        <Text className="text-sm text-text-muted dark:text-text-muted-dark text-center mb-6 leading-relaxed px-4">
          Your session with <Text className="font-semibold text-text-main dark:text-text-main-dark">{selectedDoctor.name}</Text> has been successfully scheduled.
        </Text>
        
        <View className="w-full bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark rounded-3xl p-5 mb-8">
          <View className="flex-row justify-between mb-3 border-b border-border-color dark:border-border-color-dark pb-3">
            <Text className="text-xs text-text-light dark:text-text-light-dark font-bold">Consultant</Text>
            <Text className="text-xs text-text-main dark:text-text-main-dark font-extrabold">{selectedDoctor.name}</Text>
          </View>
          <View className="flex-row justify-between mb-3 border-b border-border-color dark:border-border-color-dark pb-3">
            <Text className="text-xs text-text-light dark:text-text-light-dark font-bold">Date & Time</Text>
            <Text className="text-xs text-text-main dark:text-text-main-dark font-extrabold">
              {dates[selectedDateIndex].fullString} at {selectedTime}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-text-light dark:text-text-light-dark font-bold">Consultation Type</Text>
            <Text className="text-xs text-text-main dark:text-text-main-dark font-extrabold">{consultationType}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleCloseSuccess}
          className="w-full bg-primary py-4 rounded-full items-center shadow-lg shadow-blue-500/30"
        >
          <Text className="text-white font-bold text-base">View My Bookings</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // DEFAULT VIEW: List Bookings
  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 pb-3 flex-row justify-between items-center bg-surface dark:bg-surface-dark border-b border-border-color dark:border-border-color-dark">
        <Text className="text-xl font-bold text-text-main dark:text-text-main-dark">Appointments</Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/home")}
          className="w-8 h-8 rounded-full bg-primary-light dark:bg-primary-light-dark items-center justify-center"
        >
          <Ionicons name="add" size={20} color={isDark ? "#F8FAFC" : "#1D4ED8"} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 bg-surface dark:bg-surface-dark pb-3 border-b border-border-color dark:border-border-color-dark">
        <TouchableOpacity
          onPress={() => handleTabPress("Upcoming")}
          className="flex-1 items-center py-2"
        >
          <Text className={`text-sm font-bold ${activeTab === "Upcoming" ? "text-primary" : "text-text-light dark:text-text-light-dark"}`}>
            Upcoming ({upcomingAppointments.length})
          </Text>
          {activeTab === "Upcoming" && <View className="h-0.5 bg-primary w-12 mt-2 rounded-full" />}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleTabPress("Past")}
          className="flex-1 items-center py-2"
        >
          <Text className={`text-sm font-bold ${activeTab === "Past" ? "text-primary" : "text-text-light dark:text-text-light-dark"}`}>
            Past & Cancelled ({pastAppointments.length})
          </Text>
          {activeTab === "Past" && <View className="h-0.5 bg-primary w-12 mt-2 rounded-full" />}
        </TouchableOpacity>
      </View>

      {/* Appointment Cards List */}
      {loadingList ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1565C0" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-6 pt-5"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {activeTab === "Upcoming" ? (
            upcomingAppointments.length === 0 ? (
              <View className="items-center justify-center py-20">
                <View className="w-16 h-16 bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark rounded-2xl items-center justify-center mb-4">
                  <Ionicons name="calendar-outline" size={32} color={isDark ? "#64748B" : "#94A3B8"} />
                </View>
                <Text className="text-base font-bold text-text-main dark:text-text-main-dark text-center">
                  No upcoming sessions
                </Text>
                <Text className="text-xs text-text-light dark:text-text-light-dark mt-1 text-center px-4 leading-relaxed mb-6">
                  You do not have any appointments scheduled. Start booking now.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/home")}
                  className="bg-primary px-6 py-3 rounded-full"
                >
                  <Text className="text-white font-bold text-xs">Book a Session</Text>
                </TouchableOpacity>
              </View>
            ) : (
              upcomingAppointments.map((apt) => (
                <View
                  key={apt.id}
                  className="bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark rounded-3xl p-5 mb-4 shadow-sm shadow-slate-100/50"
                >
                  {/* Doctor details */}
                  <View className="flex-row items-center border-b border-border-color dark:border-border-color-dark pb-4 mb-4">
                    <Image
                      source={{ uri: apt.doctor.image }}
                      style={{ width: 48, height: 48, borderRadius: 12 }}
                    />
                    <View className="flex-1 ml-3.5">
                      <Text className="text-sm font-bold text-text-main dark:text-text-main-dark">{apt.doctor.name}</Text>
                      <Text className="text-xs text-text-light dark:text-text-light-dark font-semibold mt-0.5">
                        {apt.doctor.specialty}
                      </Text>
                    </View>
                    <View className={`px-3 py-1 rounded-xl flex-row items-center ${
                      apt.type === "Online Call" ? "bg-primary-light dark:bg-primary-light-dark" : "bg-green-50 dark:bg-green-950/30"
                    }`}>
                      <Ionicons
                        name={apt.type === "Online Call" ? "videocam" : "business"}
                        size={10}
                        color={apt.type === "Online Call" ? (isDark ? "#60A5FA" : "#1D4ED8") : "#10B981"}
                        style={{ marginRight: 4 }}
                      />
                      <Text className={`text-[10px] font-bold ${
                        apt.type === "Online Call" ? "text-primary" : "text-green-700 dark:text-green-400"
                      }`}>
                        {apt.type}
                      </Text>
                    </View>
                  </View>

                  {/* Date & Time */}
                  <View className="flex-row items-center mb-4 bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark rounded-2xl px-4 py-3">
                    <Ionicons name="time" size={14} color={isDark ? "#94A3B8" : "#64748B"} style={{ marginRight: 6 }} />
                    <Text className="text-xs text-text-muted dark:text-text-muted-dark font-bold">
                      {apt.date} • {apt.time}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View className="flex-row justify-between gap-3">
                    <TouchableOpacity
                      onPress={() => handleCancelAppointment(apt.id)}
                      className="flex-1 py-2.5 rounded-2xl border border-border-color dark:border-border-color-dark items-center bg-surface dark:bg-surface-dark"
                    >
                      <Text className="text-xs font-bold text-text-muted dark:text-text-muted-dark">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleOpenReschedule(apt)}
                      className="flex-1 py-2.5 rounded-2xl border border-border-color dark:border-border-color-dark items-center bg-surface dark:bg-surface-dark"
                    >
                      <Text className="text-xs font-bold text-text-muted dark:text-text-muted-dark">Reschedule</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        if (apt.type === "Online Call") {
                          router.push(`/doctor-chat/${apt.doctor.id}` as any);
                        } else {
                          showAlert("Clinic Location", "Please visit the clinic location for your physical checkup.");
                        }
                      }}
                      className="flex-1 py-2.5 rounded-2xl bg-primary items-center"
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
                <View className="w-16 h-16 bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark rounded-2xl items-center justify-center mb-4">
                  <Ionicons name="time-outline" size={32} color={isDark ? "#64748B" : "#94A3B8"} />
                </View>
                <Text className="text-base font-bold text-text-main dark:text-text-main-dark text-center">
                  No past sessions
                </Text>
                <Text className="text-xs text-text-light dark:text-text-light-dark mt-1 text-center px-4 leading-relaxed">
                  Your past completed or cancelled appointments will show up here.
                </Text>
              </View>
            ) : (
              pastAppointments.map((apt) => (
                <View
                  key={apt.id}
                  className="bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark rounded-3xl p-5 mb-4 opacity-75"
                >
                  {/* Doctor details */}
                  <View className="flex-row items-center border-b border-border-color dark:border-border-color-dark pb-4 mb-4">
                    <Image
                      source={{ uri: apt.doctor.image }}
                      style={{ width: 48, height: 48, borderRadius: 12 }}
                    />
                    <View className="flex-1 ml-3.5">
                      <Text className="text-sm font-bold text-text-main dark:text-text-main-dark">{apt.doctor.name}</Text>
                      <Text className="text-xs text-text-light dark:text-text-light-dark font-semibold mt-0.5">
                        {apt.doctor.specialty}
                      </Text>
                    </View>
                    <View className={`px-3 py-1 rounded-xl ${
                      apt.status === "Completed" ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"
                    }`}>
                      <Text className={`text-[10px] font-bold ${
                        apt.status === "Completed" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                      }`}>
                        {apt.status}
                      </Text>
                    </View>
                  </View>

                  {/* Date & Time */}
                  <View className="flex-row items-center bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark rounded-2xl px-4 py-3">
                    <Ionicons name="time" size={14} color={isDark ? "#64748B" : "#94A3B8"} style={{ marginRight: 6 }} />
                    <Text className="text-xs text-text-muted dark:text-text-muted-dark font-semibold">
                      {apt.date} • {apt.time}
                    </Text>
                  </View>

                  {/* Re-book / Review action */}
                  <View className="flex-row justify-end gap-3 mt-4">
                    <TouchableOpacity
                      onPress={() => router.push(`/doctor/${apt.doctor.id}`)}
                      className="px-5 py-2.5 rounded-2xl bg-primary-light dark:bg-primary-light-dark border border-border-color dark:border-border-color-dark items-center"
                    >
                      <Text className="text-primary font-bold text-xs">Book Again</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )
          )}
        </ScrollView>
      )}

      {/* Reschedule Modal */}
      <BottomSheet
        visible={reschedulingAppointment !== null}
        onClose={() => setReschedulingAppointment(null)}
        title="Reschedule Appointment"
      >
        {reschedulingAppointment && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row items-center p-3 bg-background dark:bg-background-dark rounded-2xl mb-6">
              <Image
                source={{ uri: reschedulingAppointment.doctor.image }}
                style={{ width: 44, height: 44, borderRadius: 10 }}
              />
              <View className="ml-3">
                <Text className="text-sm font-bold text-text-main dark:text-text-main-dark">{reschedulingAppointment.doctor.name}</Text>
                <Text className="text-xs text-text-light dark:text-text-light-dark font-semibold">{reschedulingAppointment.doctor.specialty}</Text>
              </View>
            </View>

            {/* Date Strip */}
            <Text className="text-xs font-bold text-text-muted dark:text-text-muted-dark mb-3 uppercase tracking-wider">Select New Date</Text>
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
                      isSelected ? "bg-primary border-primary" : "bg-surface dark:bg-surface-dark border-border-color dark:border-border-color-dark"
                    }`}
                  >
                    <Text className={`text-[9px] font-bold ${isSelected ? "text-blue-100" : "text-text-light dark:text-text-light-dark"}`}>
                      {d.dayName}
                    </Text>
                    <Text className={`text-base font-extrabold mt-0.5 ${isSelected ? "text-white" : "text-text-main dark:text-text-main-dark"}`}>
                      {d.dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Time Grid */}
            <Text className="text-xs font-bold text-text-muted dark:text-text-muted-dark mb-3 uppercase tracking-wider">Select New Time</Text>
            <View className="flex-row flex-wrap gap-2.5 mb-8">
              {times.map((t) => {
                const isSelected = rescheduleTime === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setRescheduleTime(t)}
                    style={{ width: "31%" }}
                    className={`py-2.5 rounded-2xl items-center border ${
                      isSelected ? "bg-primary border-primary" : "bg-background dark:bg-background-dark border-border-color dark:border-border-color-dark"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${isSelected ? "text-white" : "text-text-main dark:text-text-main-dark"}`}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Action button */}
            <TouchableOpacity
              onPress={handleSaveReschedule}
              className="w-full bg-primary py-4 rounded-full items-center shadow-lg shadow-blue-500/30"
            >
              <Text className="text-white font-bold text-sm">Update Appointment</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </BottomSheet>
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
