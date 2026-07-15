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
  ActivityIndicator,
  Modal,
  TextInput,
  Switch,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { tokenStorage } from "../../services/api/storage";
import { useAlert } from "../../components/ui/AlertModal";
import { userApi } from "../../services/api/user";
import { medicalRecordApi, MedicalRecordData } from "../../services/api/medicalRecord";
import BottomSheet from "../../components/ui/BottomSheet";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProfileScreen() {
  const { showAlert } = useAlert();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Data States
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [records, setRecords] = useState<MedicalRecordData[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  // Modals Visibility
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  // Edit Profile Form States
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editBloodGroup, setEditBloodGroup] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editAllergies, setEditAllergies] = useState("");
  const [editEmergencyName, setEditEmergencyName] = useState("");
  const [editEmergencyPhone, setEditEmergencyPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Privacy & Security States
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Help & Support accordion state
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [supportMessage, setSupportMessage] = useState("");

  const faqs = [
    {
      q: "How do I book a session with a doctor?",
      a: "Go to the Home or Doctors tab, select your preferred specialist, choose a convenient date and time, choose consultation type (Online/Physical), and tap 'Confirm Appointment'."
    },
    {
      q: "What is SmartDoctor AI?",
      a: "SmartDoctor AI is our advanced virtual health assistant. It can transcribe symptoms, summarize uploaded lab reports, explain prescriptions, and provide preliminary wellness advice."
    },
    {
      q: "Is my medical data secure?",
      a: "Yes, absolutely. All your communications and uploaded medical records are protected with industry-standard end-to-end encryption. Your information is only accessible by you and your authorized care providers."
    },
    {
      q: "How do I cancel or reschedule an appointment?",
      a: "Navigate to the Appointments tab. In the 'Upcoming' list, you can tap 'Cancel' or 'Reschedule' directly on the session card."
    }
  ];

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await userApi.getProfile();
      if (response.status === "success" && response.data) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchRecords = async () => {
    try {
      setLoadingRecords(true);
      const response = await medicalRecordApi.list();
      if (response.status === "success" && response.data) {
        setRecords(response.data);
      }
    } catch (error) {
      console.error("Failed to load medical records:", error);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchRecords();
  }, []);

  const handleUploadDocument = async () => {
    if (!profile) return;
    try {
      const mockNames = [
        "Vaccination_Card.pdf",
        "Dental_Receipt.pdf",
        "Eye_Prescription.pdf",
        "MRI_Brain_Scan.png",
        "Blood_Analysis_Report.pdf",
      ];
      const mockTypes = ["PDF", "PDF", "PDF", "IMAGE", "PDF"];
      const randomIndex = Math.floor(Math.random() * mockNames.length);

      const recordName = mockNames[randomIndex];
      const recordType = mockTypes[randomIndex];

      const response = await medicalRecordApi.create({
        patientId: profile.id,
        recordType: recordType,
        description: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`, // description hosts size details
        attachmentUrl: `https://mock-document-url.com/${recordName}`,
        recordDate: new Date().toISOString(),
      });

      if (response.status === "success" || response.data) {
        showAlert("Upload Success", `"${recordName}" has been uploaded.`);
        fetchRecords();
      }
    } catch (error) {
      console.error("Failed to upload document:", error);
      showAlert("Upload Error", "Failed to upload document to the server.");
    }
  };

  const handleDeleteRecord = (id: string, name: string) => {
    showAlert(
      "Delete Document",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await medicalRecordApi.delete(id);
              if (response.status === "success") {
                showAlert("Deleted", `"${name}" has been deleted.`);
                fetchRecords();
              }
            } catch (error) {
              console.error("Failed to delete record:", error);
              showAlert("Delete Error", "Failed to delete record from the server.");
            }
          },
        },
      ]
    );
  };

  const openEditModal = () => {
    if (!profile) return;
    setEditFirstName(profile.firstName || "");
    setEditLastName(profile.lastName || "");
    setEditPhone(profile.phoneNumber || "");
    setEditGender(profile.gender || "");
    setEditBloodGroup(profile.bloodGroup || "");
    setEditDob(profile.dob ? new Date(profile.dob).toISOString().split("T")[0] : "");
    setEditAllergies(profile.allergies || "");
    setEditEmergencyName(profile.emergencyContactName || "");
    setEditEmergencyPhone(profile.emergencyContactPhone || "");
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const response = await userApi.updateProfile({
        firstName: editFirstName,
        lastName: editLastName,
        phoneNumber: editPhone,
        dob: editDob || null,
        gender: editGender || null,
        bloodGroup: editBloodGroup || null,
        allergies: editAllergies || null,
        emergencyContactName: editEmergencyName || null,
        emergencyContactPhone: editEmergencyPhone || null,
      });

      if (response.status === "success" || response.data) {
        showAlert("Success", "Profile details updated successfully.");
        setEditModalVisible(false);
        fetchProfile();
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      const msg = error.response?.data?.message || "Failed to save profile. Please check the inputs.";
      showAlert("Save Error", msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    showAlert(
      "Log Out",
      "Are you sure you want to log out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await tokenStorage.removeToken();
            router.replace("/auth");
          },
        },
      ]
    );
  };

  const handleSendSupportMessage = () => {
    if (!supportMessage.trim()) return;
    showAlert("Message Sent", "Thank you for contacting support! Our team will respond shortly.");
    setSupportMessage("");
  };

  if (loadingProfile) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark justify-center items-center">
        <ActivityIndicator size="large" color="#1565C0" />
      </SafeAreaView>
    );
  }

  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const genderOptions = ["Male", "Female", "Other"];

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-4">
        {/* User Card */}
        <View className="bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark rounded-3xl p-5 mb-6 flex-row items-center">
          <Image
            source={{ uri: profile?.avatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150" }}
            style={{ width: 68, height: 68, borderRadius: 22 }}
          />
          <View className="ml-4 flex-1">
            <Text className="text-lg font-bold text-text-main dark:text-text-main-dark">
              {profile ? `${profile.firstName} ${profile.lastName}` : "User Profile"}
            </Text>
            <Text className="text-xs text-text-light dark:text-text-light-dark font-semibold mt-0.5">{profile?.email}</Text>
            <Text className="text-xs text-primary font-bold mt-1">{profile?.phoneNumber || "No phone added"}</Text>
          </View>
        </View>

        {/* Health Metrics Grid */}
        <View className="flex-row justify-between mb-6">
          <View className="w-[31%] bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark p-3 rounded-2xl items-center">
            <Text className="text-[10px] text-text-light dark:text-text-light-dark font-bold uppercase tracking-wider mb-1">Blood</Text>
            <Text className="text-base font-extrabold text-red-500 dark:text-red-400">{profile?.bloodGroup || "--"}</Text>
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

          {loadingRecords ? (
            <ActivityIndicator size="small" color="#1565C0" className="py-6" />
          ) : records.length === 0 ? (
            <View className="items-center py-6 bg-background dark:bg-background-dark border border-dashed border-border-color dark:border-border-color-dark rounded-2xl">
              <Ionicons name="folder-open-outline" size={32} color={isDark ? "#64748B" : "#94A3B8"} className="mb-2" />
              <Text className="text-text-light dark:text-text-light-dark text-xs font-bold">No documents uploaded yet.</Text>
            </View>
          ) : (
            records.map((rec) => {
              const dateFormatted = new Date(rec.recordDate).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              });
              const isPdf = (rec.recordType || "").toUpperCase() === "PDF";
              const recordName = rec.attachmentUrl ? rec.attachmentUrl.split("/").pop() || "Document" : "Record";

              return (
                <View
                  key={rec.id}
                  className="flex-row items-center justify-between p-3 bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark rounded-2xl mb-3"
                >
                  <View className="flex-row items-center flex-1 pr-3">
                    <View className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${
                      isPdf ? "bg-red-50 dark:bg-red-950/30" : "bg-primary-light dark:bg-primary-light-dark"
                    }`}>
                      <Ionicons
                        name={isPdf ? "document-text" : "image"}
                        size={18}
                        color={isPdf ? "#EF4444" : "#3B82F6"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-text-main dark:text-text-main-dark" numberOfLines={1}>
                        {recordName}
                      </Text>
                      <Text className="text-[10px] text-text-light dark:text-text-light-dark font-semibold mt-0.5">
                        {dateFormatted} • {rec.description || "1.0 MB"}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteRecord(rec.id, recordName)}
                    className="w-8 h-8 items-center justify-center rounded-full bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark"
                  >
                    <Ionicons name="trash-outline" size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* Settings Menu */}
        <View className="bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark rounded-3xl p-5 mb-6">
          <Text className="text-xs font-bold text-text-light dark:text-text-light-dark mb-4 uppercase tracking-wider">Settings & Info</Text>
          
          {[
            { icon: "person-outline", title: "Edit Profile", subtitle: "Update details & credentials", action: openEditModal },
            { icon: "shield-checkmark-outline", title: "Privacy & Security", subtitle: "Passwords & biometric login", action: () => setPrivacyModalVisible(true) },
            { icon: "help-circle-outline", title: "Help & Support", subtitle: "FAQs & customer service", action: () => setHelpModalVisible(true) },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.action}
              className={`flex-row items-center justify-between py-3 ${
                index !== 2 ? "border-b border-border-color dark:border-border-color-dark mb-2" : ""
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
          onPress={handleLogout}
          className="border border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/20 py-4 rounded-3xl items-center justify-center w-full mb-10"
        >
          <Text className="text-red-500 font-bold text-sm">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: EDIT PROFILE
          ───────────────────────────────────────────────────────────────────────────── */}
      <BottomSheet
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        title="Edit Profile"
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          {/* Form Names */}
          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text className="text-xs text-text-light dark:text-text-light-dark font-bold mb-1.5">First Name</Text>
              <TextInput
                value={editFirstName}
                onChangeText={setEditFirstName}
                placeholder="First Name"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                className="p-3 bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark rounded-2xl text-text-main dark:text-text-main-dark text-sm font-semibold"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-text-light dark:text-text-light-dark font-bold mb-1.5">Last Name</Text>
              <TextInput
                value={editLastName}
                onChangeText={setEditLastName}
                placeholder="Last Name"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                className="p-3 bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark rounded-2xl text-text-main dark:text-text-main-dark text-sm font-semibold"
              />
            </View>
          </View>

          {/* Phone number */}
          <View className="mb-4">
            <Text className="text-xs text-text-light dark:text-text-light-dark font-bold mb-1.5">Phone Number</Text>
            <TextInput
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="+233..."
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              keyboardType="phone-pad"
              className="p-3 bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark rounded-2xl text-text-main dark:text-text-main-dark text-sm font-semibold"
            />
          </View>

          {/* Date of Birth */}
          <View className="mb-4">
            <Text className="text-xs text-text-light dark:text-text-light-dark font-bold mb-1.5">Date of Birth (YYYY-MM-DD)</Text>
            <TextInput
              value={editDob}
              onChangeText={setEditDob}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              className="p-3 bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark rounded-2xl text-text-main dark:text-text-main-dark text-sm font-semibold"
            />
          </View>

          {/* Gender selector */}
          <View className="mb-4">
            <Text className="text-xs text-text-light dark:text-text-light-dark font-bold mb-1.5">Gender</Text>
            <View className="flex-row gap-3">
              {genderOptions.map((g) => {
                const isSel = editGender === g;
                return (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setEditGender(g)}
                    className={`flex-1 py-3 rounded-2xl border items-center justify-center ${
                      isSel
                        ? "bg-primary border-primary"
                        : "bg-background dark:bg-background-dark border-border-color dark:border-border-color-dark"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${isSel ? "text-white" : "text-text-main dark:text-text-main-dark"}`}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Blood group selector */}
          <View className="mb-4">
            <Text className="text-xs text-text-light dark:text-text-light-dark font-bold mb-1.5">Blood Group</Text>
            <View className="flex-row flex-wrap gap-2">
              {bloodGroupOptions.map((bg) => {
                const isSel = editBloodGroup === bg;
                return (
                  <TouchableOpacity
                    key={bg}
                    onPress={() => setEditBloodGroup(bg)}
                    style={{ width: "23%" }}
                    className={`py-2 rounded-xl border items-center justify-center ${
                      isSel
                        ? "bg-primary border-primary"
                        : "bg-background dark:bg-background-dark border-border-color dark:border-border-color-dark"
                    }`}
                  >
                    <Text className={`text-xs font-bold ${isSel ? "text-white" : "text-text-main dark:text-text-main-dark"}`}>
                      {bg}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Allergies */}
          <View className="mb-4">
            <Text className="text-xs text-text-light dark:text-text-light-dark font-bold mb-1.5">Known Allergies</Text>
            <TextInput
              value={editAllergies}
              onChangeText={setEditAllergies}
              placeholder="e.g. Penicillin, Peanuts"
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              multiline
              style={{ minHeight: 60 }}
              className="p-3 bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark rounded-2xl text-text-main dark:text-text-main-dark text-sm font-semibold"
            />
          </View>

          {/* Emergency Contact Name */}
          <View className="mb-4">
            <Text className="text-xs text-text-light dark:text-text-light-dark font-bold mb-1.5">Emergency Contact Name</Text>
            <TextInput
              value={editEmergencyName}
              onChangeText={setEditEmergencyName}
              placeholder="Contact Name"
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              className="p-3 bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark rounded-2xl text-text-main dark:text-text-main-dark text-sm font-semibold"
            />
          </View>

          {/* Emergency Contact Phone */}
          <View className="mb-6">
            <Text className="text-xs text-text-light dark:text-text-light-dark font-bold mb-1.5">Emergency Contact Phone</Text>
            <TextInput
              value={editEmergencyPhone}
              onChangeText={setEditEmergencyPhone}
              placeholder="Contact Phone"
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              keyboardType="phone-pad"
              className="p-3 bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark rounded-2xl text-text-main dark:text-text-main-dark text-sm font-semibold"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSaveProfile}
            disabled={savingProfile}
            className="w-full bg-primary py-4 rounded-full items-center shadow-lg shadow-blue-500/30"
          >
            {savingProfile ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold text-base">Save Details</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </BottomSheet>

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: PRIVACY & SECURITY
          ───────────────────────────────────────────────────────────────────────────── */}
      <BottomSheet
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
        title="Privacy & Security"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Option: Biometric Login */}
          <View className="flex-row items-center justify-between py-4 border-b border-border-color dark:border-border-color-dark">
            <View className="flex-1 pr-4">
              <Text className="text-sm font-bold text-text-main dark:text-text-main-dark">Biometric Unlock</Text>
              <Text className="text-[10px] text-text-light dark:text-text-light-dark font-semibold mt-0.5">
                Secure your logs with FaceID or Fingerprint scan.
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: "#CBD5E1", true: "#3B82F6" }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Option: Two-Factor Auth */}
          <View className="flex-row items-center justify-between py-4 border-b border-border-color dark:border-border-color-dark">
            <View className="flex-1 pr-4">
              <Text className="text-sm font-bold text-text-main dark:text-text-main-dark">Two-Factor Authentication (2FA)</Text>
              <Text className="text-[10px] text-text-light dark:text-text-light-dark font-semibold mt-0.5">
                Require OTP verification when logging in.
              </Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={setTwoFactorEnabled}
              trackColor={{ false: "#CBD5E1", true: "#3B82F6" }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Option: Change Password */}
          <TouchableOpacity
            onPress={() => showAlert("Reset Password", "A secure link to change your password has been sent to your registered email.")}
            className="flex-row items-center justify-between py-4 border-b border-border-color dark:border-border-color-dark"
          >
            <View>
              <Text className="text-sm font-bold text-text-main dark:text-text-main-dark">Change Password</Text>
              <Text className="text-[10px] text-text-light dark:text-text-light-dark font-semibold mt-0.5">
                Send password reset instructions to email.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={isDark ? "#475569" : "#CBD5E1"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPrivacyModalVisible(false)}
            className="w-full bg-primary py-4 rounded-full items-center mt-8 shadow-lg shadow-blue-500/30"
          >
            <Text className="text-white font-bold text-sm">Close Settings</Text>
          </TouchableOpacity>
        </ScrollView>
      </BottomSheet>

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: HELP & SUPPORT
          ───────────────────────────────────────────────────────────────────────────── */}
      <BottomSheet
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
        title="Help & Support"
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          <Text className="text-xs font-bold text-text-light dark:text-text-light-dark mb-3 uppercase tracking-wider">Frequently Asked Questions</Text>
          
          {/* FAQ Accordion */}
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaqIndex === idx;
            return (
              <View key={idx} className="bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark rounded-2xl p-4 mb-3">
                <TouchableOpacity
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setExpandedFaqIndex(isExpanded ? null : idx);
                  }}
                  className="flex-row justify-between items-center"
                >
                  <Text className="text-xs font-bold text-text-main dark:text-text-main-dark flex-1 pr-4">{faq.q}</Text>
                  <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={14} color={isDark ? "#94A3B8" : "#64748B"} />
                </TouchableOpacity>
                {isExpanded && (
                  <Text className="text-[11px] text-text-muted dark:text-text-muted-dark leading-relaxed font-semibold mt-3 pt-3 border-t border-border-color dark:border-border-color-dark">
                    {faq.a}
                  </Text>
                )}
              </View>
            );
          })}

          {/* Contact Form */}
          <Text className="text-xs font-bold text-text-light dark:text-text-light-dark mt-6 mb-3 uppercase tracking-wider">Contact Care Support</Text>
          <View className="mb-6">
            <TextInput
              value={supportMessage}
              onChangeText={setSupportMessage}
              placeholder="How can we help you? Describe your issue or suggestion..."
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              multiline
              style={{ minHeight: 80 }}
              className="p-3 bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark rounded-2xl text-text-main dark:text-text-main-dark text-sm font-semibold mb-3"
            />
            <TouchableOpacity
              onPress={handleSendSupportMessage}
              className="bg-primary py-3.5 rounded-full items-center"
            >
              <Text className="text-white font-bold text-xs">Send Message</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
