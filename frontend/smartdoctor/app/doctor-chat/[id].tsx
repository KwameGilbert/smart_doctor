import React, { useState, useEffect, useRef } from "react";
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
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ALL_DOCTORS } from "../../constants/data";
import ChatInput from "../../components/ChatInput";
import { userApi } from "../../services/api/user";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Message {
  id: string;
  sender: "user" | "doctor";
  text?: string;
  imageUri?: string;
  fileName?: string;
  fileSize?: string;
  audioDuration?: string;
  timestamp: string;
}

export default function DoctorChatScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const { id } = useLocalSearchParams();
  const [doctor, setDoctor] = useState<any>(
    ALL_DOCTORS.find((d) => d.id === id) || ALL_DOCTORS[0]
  );

  useEffect(() => {
    if (typeof id === "string") {
      userApi.getDoctorDetail(id)
        .then((response) => {
          if (response.status === "success" && response.data) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setDoctor(response.data);
          }
        })
        .catch((err) => {
          console.error("Error fetching doctor detail in chat:", err);
        });
    }
  }, [id]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      sender: "doctor",
      text: `Hello Elton. I've reviewed your recent checkup results. They look stable, but let's continue monitoring daily.`,
      timestamp: "10:10 AM",
    },
    {
      id: "init-2",
      sender: "user",
      text: "Okay, thank you doctor. I am taking the medications as prescribed.",
      timestamp: "10:12 AM",
    },
    {
      id: "init-3",
      sender: "doctor",
      text: "Excellent. Remember to check in if you feel any discomfort. Make sure to take your meds on time!",
      timestamp: "10:14 AM",
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);

  // VOIP Call states
  const [callType, setCallType] = useState<"audio" | "video" | null>(null);
  const [callStatus, setCallStatus] = useState<"ringing" | "connected" | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const callTimer = useRef<any>(null);
  const callStatusTimeout = useRef<any>(null);

  // Microphone and speaker states for calls
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const scrollViewRef = useRef<ScrollView>(null);

  // VOIP Call duration timer
  useEffect(() => {
    if (callStatus === "connected") {
      callTimer.current = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimer.current) clearInterval(callTimer.current);
      setCallSeconds(0);
    }
    return () => {
      if (callTimer.current) clearInterval(callTimer.current);
    };
  }, [callStatus]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const handleSend = (
    text: string,
    attachments: {
      image?: string;
      file?: { name: string; size: string };
      audio?: { name: string; duration: string };
    }
  ) => {
    const { image, file, audio } = attachments;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: text || undefined,
      imageUri: image || undefined,
      fileName: file?.name,
      fileSize: file?.size,
      audioDuration: audio?.duration,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages((prev) => [...prev, userMsg]);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    // Simulate Doctor Response
    setIsTyping(true);
    setTimeout(() => {
      let docText = "";
      if (image) {
        docText = "I see. Let's keep it under observation. Clean it with warm water and avoid scratching. I'll write a prescription if it persists.";
      } else if (file) {
        docText = "Thank you for sending the report. I will check it in detail and write back to you shortly.";
      } else if (audio) {
        docText = "Received your message. It sounds like you are recovering well. Just continue with the prescribed dosage.";
      } else {
        const query = text.toLowerCase();
        if (query.includes("pill") || query.includes("medicine") || query.includes("drug")) {
          docText = "Make sure you take the medication strictly after meals as specified. Let me know if you experience any side effects.";
        } else if (query.includes("pain") || query.includes("hurt")) {
          docText = "Please monitor the intensity of the pain. If it worsens, we should reschedule for a physical exam at the clinic.";
        } else {
          docText = `Acknowledged. Continue with the guidelines we set, and let me know if you notice any changes.`;
        }
      }

      const docMsg: Message = {
        id: `msg-${Date.now()}`,
        sender: "doctor",
        text: docText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages((prev) => [...prev, docMsg]);
      setIsTyping(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1500);
  };

  // VOIP Call Launchers
  const handleStartCall = (type: "audio" | "video") => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCallType(type);
    setCallStatus("ringing");
    setIsMuted(false);
    setIsSpeakerOn(false);
    setIsCameraOn(true);

    callStatusTimeout.current = setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCallStatus("connected");
    }, 3000);
  };

  const handleEndCall = () => {
    if (callStatusTimeout.current) clearTimeout(callStatusTimeout.current);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCallType(null);
    setCallStatus(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-surface-dark" edges={["top"]}>
      {/* Chat Header */}
      <View className="px-6 pt-2 pb-4 bg-surface dark:bg-surface-dark border-b border-border-color dark:border-border-color-dark flex-row justify-between items-center">
        <View className="flex-row items-center flex-1 pr-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 items-center justify-center rounded-full bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark mr-2"
          >
            <Ionicons name="chevron-back" size={20} color={isDark ? "#F8FAFC" : "#1E293B"} />
          </TouchableOpacity>
          
          <View className="relative">
            <Image
              source={{ uri: doctor.image }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
              contentFit="cover"
            />
            <View className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-sm font-bold text-text-main dark:text-text-main-dark leading-snug" numberOfLines={1}>
              {doctor.name}
            </Text>
            <Text className="text-[10px] text-text-light dark:text-text-light-dark font-bold uppercase tracking-wider" numberOfLines={1}>
              {doctor.specialty}
            </Text>
          </View>
        </View>

        {/* Call Buttons */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handleStartCall("audio")}
            className="w-9 h-9 items-center justify-center rounded-full bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark"
          >
            <Ionicons name="call-outline" size={18} color={isDark ? "#60A5FA" : "#1565C0"} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleStartCall("video")}
            className="w-9 h-9 items-center justify-center rounded-full bg-background dark:bg-background-dark border border-border-color dark:border-border-color-dark"
          >
            <Ionicons name="videocam-outline" size={18} color={isDark ? "#60A5FA" : "#1565C0"} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 60 : 0}
      >
        {/* Messages List */}
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          className="flex-1 px-6 bg-background dark:bg-background-dark"
          contentContainerStyle={{ paddingVertical: 20, paddingBottom: 16 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <View
                key={msg.id}
                className={`flex-row mb-5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {/* Doctor Avatar */}
                {!isUser && (
                  <Image
                    source={{ uri: doctor.image }}
                    style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8, marginTop: 2 }}
                    contentFit="cover"
                  />
                )}

                <View className="max-w-[78%]">
                  <View
                    className={`rounded-[24px] p-4 ${
                      isUser
                        ? "bg-primary rounded-tr-none"
                        : "bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark rounded-tl-none shadow-sm shadow-slate-100/40"
                    }`}
                  >
                    {/* Render Image attachment */}
                    {msg.imageUri && (
                      <View className="mb-2 rounded-2xl overflow-hidden">
                        <Image source={{ uri: msg.imageUri }} style={{ width: "100%", height: 160 }} contentFit="cover" />
                      </View>
                    )}

                    {/* Render File attachment */}
                    {msg.fileName && (
                      <View className={`flex-row items-center p-3 rounded-2xl mb-2 border ${
                        isUser ? "bg-blue-600/40 border-blue-400/30" : "bg-red-50/50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50"
                      }`}>
                        <Ionicons name="document-text" size={24} color={isUser ? "#FFFFFF" : "#EF4444"} />
                        <View className="ml-3 flex-1">
                          <Text className={`text-xs font-bold ${isUser ? "text-white" : "text-text-main dark:text-text-main-dark"}`} numberOfLines={1}>
                            {msg.fileName}
                          </Text>
                          <Text className={`text-[9px] font-semibold mt-0.5 ${isUser ? "text-blue-200" : "text-text-light dark:text-text-light-dark"}`}>
                            {msg.fileSize}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Render Audio attachment */}
                    {msg.audioDuration && (
                      <View className={`flex-row items-center py-1.5 px-2 rounded-2xl mb-1 ${
                        isUser ? "bg-blue-600/40" : "bg-primary-light dark:bg-primary-light-dark"
                      }`} style={{ width: 220 }}>
                        <TouchableOpacity className={`w-8 h-8 rounded-full items-center justify-center ${
                          isUser ? "bg-white/20" : "bg-blue-500"
                        }`}>
                          <Ionicons name="play" size={14} color="#FFFFFF" style={{ marginLeft: 2 }} />
                        </TouchableOpacity>
                        
                        <View className="flex-row items-center flex-1 mx-3 gap-0.5">
                          {[3, 2, 5, 3, 4, 3, 2, 4, 3, 5, 2, 3, 4, 2, 3, 4].map((h, i) => (
                            <View
                              key={i}
                              className={`w-0.5 rounded-full ${isUser ? "bg-white" : "bg-text-light dark:bg-text-light-dark"}`}
                              style={{ height: h * 2.5 }}
                            />
                          ))}
                        </View>
                        <Text className={`text-[10px] font-bold ${isUser ? "text-blue-100" : "text-text-muted dark:text-text-muted-dark"}`}>
                          {msg.audioDuration}
                        </Text>
                      </View>
                    )}

                    {/* Text Message */}
                    {msg.text && (
                      <Text
                        className={`text-sm leading-relaxed ${
                          isUser ? "text-white font-medium" : "text-text-main dark:text-text-main-dark"
                        }`}
                      >
                        {msg.text}
                      </Text>
                    )}
                  </View>

                  <Text
                    className={`text-[9px] text-text-light dark:text-text-light-dark font-bold mt-1.5 ${
                      isUser ? "text-right" : "text-left"
                    }`}
                  >
                    {msg.timestamp}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Doctor Typing Loader */}
          {isTyping && (
            <View className="flex-row mb-5 justify-start">
              <Image
                source={{ uri: doctor.image }}
                style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8, marginTop: 2 }}
                contentFit="cover"
              />
              <View className="bg-surface dark:bg-surface-dark border border-border-color dark:border-border-color-dark rounded-3xl rounded-tl-none p-4 shadow-sm shadow-slate-100/40">
                <View className="flex-row items-center gap-1.5 py-1 px-2">
                  <View className="w-2 h-2 bg-text-light dark:bg-text-light-dark rounded-full animate-bounce" />
                  <View className="w-2 h-2 bg-text-muted dark:bg-text-muted-dark rounded-full animate-bounce" />
                  <View className="w-2 h-2 bg-text-light dark:bg-text-light-dark rounded-full animate-bounce" />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* WhatsApp Reusable Chat Input Component */}
        <ChatInput
          placeholder={`Message ${doctor.name}...`}
          onSend={handleSend}
        />
      </KeyboardAvoidingView>

      {/* VOIP CALL MODAL OVERLAY */}
      <Modal
        visible={callType !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={handleEndCall}
      >
        {callType === "video" ? (
          /* VIDEO CALL OVERLAY */
          <View className="flex-1 bg-slate-900 justify-between py-16 px-6 relative">
            {callStatus === "ringing" ? (
              <View className="flex-1 items-center justify-center">
                <Image
                  source={{ uri: doctor.image }}
                  style={{ width: 120, height: 120, borderRadius: 60 }}
                  contentFit="cover"
                  className="border-2 border-white/20 mb-6"
                />
                <Text className="text-xl font-bold text-white mb-2">{doctor.name}</Text>
                <Text className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-8">Video Consultation Call</Text>
                <Text className="text-sm text-slate-400 font-medium animate-pulse">Ringing...</Text>
              </View>
            ) : (
              <View className="flex-1 relative">
                <View className="absolute inset-0 bg-slate-800 rounded-[32px] overflow-hidden items-center justify-center">
                  <Image
                    source={{ uri: doctor.image }}
                    style={{ width: "100%", height: "100%", opacity: isCameraOn ? 0.95 : 0.3 }}
                    contentFit="cover"
                  />
                  {!isCameraOn && (
                    <View className="absolute items-center">
                      <Ionicons name="videocam-off" size={48} color="#94A3B8" className="mb-2" />
                      <Text className="text-slate-400 text-xs font-bold">{"Doctor's camera is off"}</Text>
                    </View>
                  )}
                  <View className="absolute top-6 left-6 bg-black/40 px-3 py-1.5 rounded-full flex-row items-center border border-white/10">
                    <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    <Text className="text-white text-xs font-bold">{formatTime(callSeconds)}</Text>
                  </View>
                </View>

                <View 
                  className="absolute bottom-24 right-4 w-28 h-40 bg-slate-700 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
                  style={{ elevation: 15 }}
                >
                  <Image
                    source={{ uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150" }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                  <View className="absolute bottom-2 left-2 bg-black/40 px-1.5 py-0.5 rounded-md">
                    <Text className="text-white text-[8px] font-bold">You</Text>
                  </View>
                </View>
              </View>
            )}

            <View className="flex-row justify-around items-center w-full px-6 absolute bottom-10 left-6 right-6">
              <TouchableOpacity
                onPress={() => setIsMuted(!isMuted)}
                className={`w-14 h-14 rounded-full items-center justify-center border ${
                  isMuted ? "bg-white border-white" : "bg-white/10 border-white/20"
                }`}
              >
                <Ionicons name={isMuted ? "mic-off" : "mic"} size={22} color={isMuted ? "#1E293B" : "#FFFFFF"} />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleEndCall}
                className="w-16 h-16 bg-red-500 rounded-full items-center justify-center shadow-lg"
              >
                <Ionicons name="call" size={26} color="#FFFFFF" style={{ transform: [{ rotate: "135deg" }] }} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsCameraOn(!isCameraOn)}
                className={`w-14 h-14 rounded-full items-center justify-center border ${
                  !isCameraOn ? "bg-white border-white" : "bg-white/10 border-white/20"
                }`}
              >
                <Ionicons name={isCameraOn ? "videocam" : "videocam-off"} size={22} color={isCameraOn ? "#FFFFFF" : "#1E293B"} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* AUDIO VOICE CALL OVERLAY */
          <View style={styles.modalOverlay} className="bg-slate-900 flex-1 justify-between py-20 px-6">
            <View className="items-center mt-10">
              <Image
                source={{ uri: doctor.image }}
                style={{ width: 120, height: 120, borderRadius: 60 }}
                contentFit="cover"
                className="border-4 border-white/10 mb-6 shadow-2xl"
              />
              <Text className="text-xl font-bold text-white mb-2">{doctor.name}</Text>
              <Text className="text-xs text-blue-300 font-bold uppercase tracking-wider">Audio Consultation Call</Text>
            </View>

            <View className="items-center justify-center">
              {callStatus === "ringing" ? (
                <Text className="text-sm text-slate-400 font-medium animate-pulse">Ringing...</Text>
              ) : (
                <View className="items-center">
                  <Text className="text-2xl font-bold text-white mb-1">{formatTime(callSeconds)}</Text>
                  <Text className="text-[10px] text-green-400 font-bold uppercase tracking-wide">Connected</Text>
                </View>
              )}
            </View>

            <View className="flex-row justify-around items-center w-full px-6 mb-4">
              <TouchableOpacity
                onPress={() => setIsMuted(!isMuted)}
                className={`w-14 h-14 rounded-full items-center justify-center border ${
                  isMuted ? "bg-white border-white" : "bg-white/10 border-white/20"
                }`}
              >
                <Ionicons name={isMuted ? "mic-off" : "mic"} size={22} color={isMuted ? "#1E293B" : "#FFFFFF"} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleEndCall}
                className="w-16 h-16 bg-red-500 rounded-full items-center justify-center shadow-lg"
              >
                <Ionicons name="call" size={26} color="#FFFFFF" style={{ transform: [{ rotate: "135deg" }] }} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`w-14 h-14 rounded-full items-center justify-center border ${
                  isSpeakerOn ? "bg-white border-white" : "bg-white/10 border-white/20"
                }`}
              >
                <Ionicons name={isSpeakerOn ? "volume-high" : "volume-medium"} size={22} color={isSpeakerOn ? "#1E293B" : "#FFFFFF"} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
});
