import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  UIManager,
  LayoutAnimation,
  Alert,
  Modal,
  KeyboardAvoidingView,
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
  const { id } = useLocalSearchParams();
  const doctor = ALL_DOCTORS.find((d) => d.id === id) || ALL_DOCTORS[0];

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

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  // Attachment states
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);
  const [attachedAudio, setAttachedAudio] = useState<{ name: string; duration: string } | null>(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimer = useRef<any>(null);

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

  // Recording Timer effect
  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
    };
  }, [isRecording]);

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

  const handleSend = (overrideText?: string, overrideAttachments?: { image?: string; file?: { name: string; size: string }; audio?: { name: string; duration: string } }) => {
    const textToSend = overrideText !== undefined ? overrideText : inputText;
    const imgToSend = overrideAttachments ? overrideAttachments.image : attachedImage;
    const fileToSend = overrideAttachments ? overrideAttachments.file : attachedFile;
    const audioToSend = overrideAttachments ? overrideAttachments.audio : attachedAudio;

    if (!textToSend.trim() && !imgToSend && !fileToSend && !audioToSend) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend || undefined,
      imageUri: imgToSend || undefined,
      fileName: fileToSend?.name,
      fileSize: fileToSend?.size,
      audioDuration: audioToSend?.duration,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages((prev) => [...prev, userMsg]);

    setInputText("");
    setAttachedImage(null);
    setAttachedFile(null);
    setAttachedAudio(null);
    setShowAttachmentMenu(false);

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    // Simulate Doctor Response
    setIsTyping(true);
    setTimeout(() => {
      let docText = "";
      if (imgToSend) {
        docText = "I see. Let's keep it under observation. Clean it with warm water and avoid scratching. I'll write a prescription if it persists.";
      } else if (fileToSend) {
        docText = "Thank you for sending the report. I will check it in detail and write back to you shortly.";
      } else if (audioToSend) {
        docText = "Received your message. It sounds like you are recovering well. Just continue with the prescribed dosage.";
      } else {
        const query = textToSend.toLowerCase();
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

  // Simulators for attachments
  const handleAttachImage = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAttachedImage("https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=300");
    setAttachedFile(null);
    setAttachedAudio(null);
    setShowAttachmentMenu(false);
  };

  const handleAttachFile = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAttachedFile({ name: "Lab_Result_Data.pdf", size: "850 KB" });
    setAttachedImage(null);
    setAttachedAudio(null);
    setShowAttachmentMenu(false);
  };

  const handleStartRecording = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsRecording(false);
    setAttachedAudio({ name: "Voice Note.mp3", duration: formatTime(recordingSeconds) });
    setAttachedImage(null);
    setAttachedFile(null);
  };

  // VOIP Call Launchers
  const handleStartCall = (type: "audio" | "video") => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCallType(type);
    setCallStatus("ringing");
    setIsMuted(false);
    setIsSpeakerOn(false);
    setIsCameraOn(true);

    // Transition from Ringing to Connected after 3 seconds
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
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Chat Header */}
      <View className="px-6 pt-2 pb-4 bg-white border-b border-slate-100 flex-row justify-between items-center">
        <View className="flex-row items-center flex-1 pr-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 items-center justify-center rounded-full bg-slate-50 border border-slate-100 mr-2"
          >
            <Ionicons name="chevron-back" size={20} color="#1E293B" />
          </TouchableOpacity>
          
          <View className="relative">
            <Image
              source={{ uri: doctor.image }}
              style={{ width: 40, height: 40, borderRadius: 12 }}
              contentFit="cover"
            />
            <View className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-sm font-bold text-slate-800 leading-snug" numberOfLines={1}>
              {doctor.name}
            </Text>
            <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider" numberOfLines={1}>
              {doctor.specialty}
            </Text>
          </View>
        </View>

        {/* Call Buttons */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handleStartCall("audio")}
            className="w-9 h-9 items-center justify-center rounded-full bg-slate-50 border border-slate-100"
          >
            <Ionicons name="call-outline" size={18} color="#1565C0" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleStartCall("video")}
            className="w-9 h-9 items-center justify-center rounded-full bg-slate-50 border border-slate-100"
          >
            <Ionicons name="videocam-outline" size={18} color="#1565C0" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Messages List */}
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          className="flex-1 px-6 bg-slate-50/50"
          contentContainerStyle={{ paddingVertical: 20, paddingBottom: 60 }}
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
                    style={{ width: 32, height: 32, borderRadius: 10, marginRight: 8, marginTop: 2 }}
                    contentFit="cover"
                  />
                )}

                <View className="max-w-[78%]">
                  <View
                    className={`rounded-[24px] p-4 ${
                      isUser
                        ? "bg-[#1D4ED8] rounded-tr-none"
                        : "bg-white border border-slate-100 rounded-tl-none shadow-sm shadow-slate-100/40"
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
                        isUser ? "bg-blue-600/40 border-blue-400/30" : "bg-red-50/50 border-red-100"
                      }`}>
                        <Ionicons name="document-text" size={24} color={isUser ? "#FFFFFF" : "#EF4444"} />
                        <View className="ml-3 flex-1">
                          <Text className={`text-xs font-bold ${isUser ? "text-white" : "text-slate-800"}`} numberOfLines={1}>
                            {msg.fileName}
                          </Text>
                          <Text className={`text-[9px] font-semibold mt-0.5 ${isUser ? "text-blue-200" : "text-slate-400"}`}>
                            {msg.fileSize}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Render Audio attachment */}
                    {msg.audioDuration && (
                      <View className={`flex-row items-center py-1.5 px-2 rounded-2xl mb-1 ${
                        isUser ? "bg-blue-600/40" : "bg-blue-50/50"
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
                              className={`w-0.5 rounded-full ${isUser ? "bg-white" : "bg-slate-300"}`}
                              style={{ height: h * 2.5 }}
                            />
                          ))}
                        </View>
                        <Text className={`text-[10px] font-bold ${isUser ? "text-blue-100" : "text-slate-500"}`}>
                          {msg.audioDuration}
                        </Text>
                      </View>
                    )}

                    {/* Text Message */}
                    {msg.text && (
                      <Text
                        className={`text-sm leading-relaxed ${
                          isUser ? "text-white font-medium" : "text-slate-800"
                        }`}
                      >
                        {msg.text}
                      </Text>
                    )}
                  </View>

                  <Text
                    className={`text-[9px] text-slate-400 font-bold mt-1.5 ${
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
                style={{ width: 32, height: 32, borderRadius: 10, marginRight: 8, marginTop: 2 }}
                contentFit="cover"
              />
              <View className="bg-white border border-slate-100 rounded-3xl rounded-tl-none p-4 shadow-sm shadow-slate-100/40">
                <View className="flex-row items-center gap-1.5 py-1 px-2">
                  <View className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                  <View className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <View className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Attachment Preview Bar */}
        {(attachedImage || attachedFile || attachedAudio) && (
          <View className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 flex-row gap-3">
            {attachedImage && (
              <View className="relative">
                <Image source={{ uri: attachedImage }} style={{ width: 60, height: 60, borderRadius: 12 }} />
                <TouchableOpacity
                  onPress={() => setAttachedImage(null)}
                  className="absolute -top-1.5 -right-1.5 bg-slate-800 rounded-full w-5 h-5 items-center justify-center border border-white"
                >
                  <Ionicons name="close" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
            {attachedFile && (
              <View className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-2xl flex-row items-center relative max-w-[220px] shadow-sm">
                <Ionicons name="document-text" size={20} color="#EF4444" />
                <View className="ml-2 mr-3">
                  <Text className="text-xs text-slate-800 font-bold" numberOfLines={1}>
                    {attachedFile.name}
                  </Text>
                  <Text className="text-[9px] text-slate-400 font-semibold">{attachedFile.size}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setAttachedFile(null)}
                  className="absolute -top-1.5 -right-1.5 bg-slate-800 rounded-full w-5 h-5 items-center justify-center border border-white"
                >
                  <Ionicons name="close" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
            {attachedAudio && (
              <View className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-2xl flex-row items-center relative shadow-sm">
                <Ionicons name="mic" size={18} color="#1D4ED8" />
                <View className="ml-2 mr-3">
                  <Text className="text-xs text-slate-800 font-bold">{attachedAudio.name}</Text>
                  <Text className="text-[9px] text-slate-400 font-semibold">{attachedAudio.duration}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setAttachedAudio(null)}
                  className="absolute -top-1.5 -right-1.5 bg-slate-800 rounded-full w-5 h-5 items-center justify-center border border-white"
                >
                  <Ionicons name="close" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Input Bar */}
        <View className="px-5 py-4 bg-white border-t border-slate-100 flex-row items-center gap-3">
          {isRecording ? (
            <View className="flex-1 bg-red-50/50 border border-red-100 rounded-full px-5 py-3 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-2.5 h-2.5 bg-red-500 rounded-full mr-2" />
                <Text className="text-xs text-red-600 font-bold">Recording {formatTime(recordingSeconds)}</Text>
              </View>
              <TouchableOpacity onPress={handleStopRecording} className="px-3.5 py-1.5 bg-red-500 rounded-full">
                <Text className="text-white text-[10px] font-bold uppercase tracking-wider">Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Attachment trigger */}
              <TouchableOpacity
                onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
                className={`w-11 h-11 items-center justify-center rounded-full border ${
                  showAttachmentMenu ? "bg-slate-100 border-slate-200" : "bg-slate-50 border-slate-100"
                }`}
              >
                <Ionicons
                  name={showAttachmentMenu ? "close" : "add"}
                  size={22}
                  color={showAttachmentMenu ? "#EF4444" : "#64748B"}
                />
              </TouchableOpacity>

              <View className="flex-1 bg-slate-100 px-5 py-3 rounded-full border border-slate-200/50 flex-row items-center">
                <TextInput
                  placeholder={`Message ${doctor.name}...`}
                  placeholderTextColor="#94A3B8"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  style={{ padding: 0, maxHeight: 60 }}
                  className="flex-1 text-slate-800 text-sm font-medium"
                />
              </View>
            </>
          )}

          {/* Action button */}
          {!isRecording && (
            <TouchableOpacity
              onPress={() => {
                if (inputText.trim() || attachedImage || attachedFile || attachedAudio) {
                  handleSend();
                } else {
                  handleStartRecording();
                }
              }}
              className="w-11 h-11 bg-[#1D4ED8] rounded-full items-center justify-center shadow-md"
            >
              <Ionicons
                name={
                  inputText.trim() || attachedImage || attachedFile || attachedAudio
                    ? "send"
                    : "mic"
                }
                size={18}
                color="#FFFFFF"
                style={inputText.trim() || attachedImage || attachedFile || attachedAudio ? { marginLeft: 2 } : {}}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Attachment Options Drawer */}
        {showAttachmentMenu && (
          <View className="bg-slate-50 border-t border-slate-200 px-6 py-5 flex-row justify-around">
            <TouchableOpacity onPress={handleAttachImage} className="items-center">
              <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center mb-2 shadow-sm">
                <Ionicons name="image" size={22} color="#1D4ED8" />
              </View>
              <Text className="text-[10px] text-slate-600 font-bold">Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleAttachFile} className="items-center">
              <View className="w-12 h-12 bg-red-100 rounded-2xl items-center justify-center mb-2 shadow-sm">
                <Ionicons name="document-text" size={22} color="#EF4444" />
              </View>
              <Text className="text-[10px] text-slate-600 font-bold">Document</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleStartRecording} className="items-center">
              <View className="w-12 h-12 bg-purple-100 rounded-2xl items-center justify-center mb-2 shadow-sm">
                <Ionicons name="mic" size={22} color="#8B5CF6" />
              </View>
              <Text className="text-[10px] text-slate-600 font-bold">Voice Note</Text>
            </TouchableOpacity>
          </View>
        )}
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
              /* Video Ringing layout */
              <View className="flex-1 items-center justify-center">
                <Image
                  source={{ uri: doctor.image }}
                  style={{ width: 120, height: 120, borderRadius: 30 }}
                  contentFit="cover"
                  className="border-2 border-white/20 mb-6"
                />
                <Text className="text-xl font-bold text-white mb-2">{doctor.name}</Text>
                <Text className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-8">Video Consultation Call</Text>
                <Text className="text-sm text-slate-400 font-medium animate-pulse">Ringing...</Text>
              </View>
            ) : (
              /* Video Connected layout */
              <View className="flex-1 relative">
                {/* Full-screen Remote Video View (Mock) */}
                <View className="absolute inset-0 bg-slate-800 rounded-[32px] overflow-hidden items-center justify-center">
                  <Image
                    source={{ uri: doctor.image }}
                    style={{ width: "100%", height: "100%", opacity: isCameraOn ? 0.95 : 0.3 }}
                    contentFit="cover"
                  />
                  {!isCameraOn && (
                    <View className="absolute items-center">
                      <Ionicons name="videocam-off" size={48} color="#94A3B8" className="mb-2" />
                      <Text className="text-slate-400 text-xs font-bold">Doctor's camera is off</Text>
                    </View>
                  )}
                  {/* Call Timer Overlay */}
                  <View className="absolute top-6 left-6 bg-black/40 px-3 py-1.5 rounded-full flex-row items-center border border-white/10">
                    <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    <Text className="text-white text-xs font-bold">{formatTime(callSeconds)}</Text>
                  </View>
                </View>

                {/* Local Camera Picture-in-Picture Preview */}
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

            {/* Calling control panel */}
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

            {/* Audio call controls */}
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
