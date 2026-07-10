import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  LayoutAnimation,
  Alert,
  Modal,
  Keyboard,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { DUMMY_MEDICAL_RECORDS, MedicalRecord } from "../constants/data";

interface ChatInputProps {
  placeholder?: string;
  onSend: (
    text: string,
    attachments: {
      image?: string;
      file?: { name: string; size: string };
      audio?: { name: string; duration: string };
    }
  ) => void;
}

export default function ChatInput({ placeholder, onSend }: ChatInputProps) {
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState("");
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Attachment states
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);
  const [attachedAudio, setAttachedAudio] = useState<{ name: string; duration: string } | null>(null);

  // Medical Record Selector state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimer = useRef<any>(null);

  // Keyboard status listeners
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardWillShow", () => {
      setIsKeyboardOpen(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardWillHide", () => {
      setIsKeyboardOpen(false);
    });

    const showSubscriptionAndroid = Keyboard.addListener("keyboardDidShow", () => {
      if (Platform.OS === "android") setIsKeyboardOpen(true);
    });
    const hideSubscriptionAndroid = Keyboard.addListener("keyboardDidHide", () => {
      if (Platform.OS === "android") setIsKeyboardOpen(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      showSubscriptionAndroid.remove();
      hideSubscriptionAndroid.remove();
    };
  }, []);

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

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const handleToggleAttachmentMenu = () => {
    if (!showAttachmentMenu) {
      // Unfocus keyboard so it hides before showing the options drawer
      Keyboard.dismiss();
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAttachmentMenu(!showAttachmentMenu);
  };

  const handleInputFocus = () => {
    // Hide attachments menu when user taps the input to type
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAttachmentMenu(false);
  };

  const handleSendPress = () => {
    if (!inputText.trim() && !attachedImage && !attachedFile && !attachedAudio) return;

    onSend(inputText, {
      image: attachedImage || undefined,
      file: attachedFile || undefined,
      audio: attachedAudio || undefined,
    });

    // Clear Staged states
    setInputText("");
    setAttachedImage(null);
    setAttachedFile(null);
    setAttachedAudio(null);
    setShowAttachmentMenu(false);
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

  const handleSelectMedicalRecord = (record: MedicalRecord) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAttachedFile({ name: record.name, size: record.size });
    setAttachedImage(null);
    setAttachedAudio(null);
    setIsRecordModalOpen(false);
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

  return (
    <View className="relative z-50">
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

      {/* Input Bar (WhatsApp style, responsive bottom safe padding) */}
      <View 
        style={{
          paddingBottom: isKeyboardOpen ? 12 : Math.max(insets.bottom, 12),
          paddingTop: 12,
        }}
        className="px-5 bg-white border-t border-slate-100 flex-row items-center gap-3"
      >
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
              onPress={handleToggleAttachmentMenu}
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
                placeholder={placeholder || "Type a message..."}
                placeholderTextColor="#94A3B8"
                value={inputText}
                onChangeText={setInputText}
                onFocus={handleInputFocus}
                multiline
                style={{ padding: 0, maxHeight: 60 }}
                className="flex-1 text-slate-800 text-sm font-medium"
              />
            </View>
          </>
        )}

        {/* Action button (Send/Mic) */}
        {!isRecording && (
          <TouchableOpacity
            onPress={() => {
              if (inputText.trim() || attachedImage || attachedFile || attachedAudio) {
                handleSendPress();
              } else {
                handleStartRecording();
              }
            }}
            className="w-11 h-11 bg-[#1D4ED8] rounded-full items-center justify-center shadow-md shadow-blue-500/10"
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

      {/* Floating Attachment Options Drawer (WhatsApp Style, overlays keyboard smoothly) */}
      {showAttachmentMenu && (
        <View 
          className="absolute bottom-20 left-4 right-4 bg-white border border-slate-100 rounded-3xl p-4 shadow-2xl z-50 flex-row flex-wrap justify-between"
          style={{
            elevation: 24,
            shadowColor: "#0F172A",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
          }}
        >
          {[
            { icon: "document-text", name: "Document", color: "#7F66FF", action: handleAttachFile },
            { icon: "folder-open", name: "Medical File", color: "#10B981", action: () => setIsRecordModalOpen(true) }, // Dynamic selector option
            { icon: "camera", name: "Camera", color: "#FF4B72", action: handleAttachImage },
            { icon: "image", name: "Gallery", color: "#20C997", action: handleAttachImage },
            { icon: "headset", name: "Audio", color: "#FF9F43", action: handleStartRecording },
            { icon: "location", name: "Location", color: "#00A8FF", action: () => Alert.alert("Location Shared", "Mock location shared successfully!") },
          ].map((item, idx) => (
            <TouchableOpacity key={idx} onPress={item.action} className="items-center w-[30%] my-2.5">
              <View 
                style={{ backgroundColor: item.color }} 
                className="w-12 h-12 rounded-full items-center justify-center mb-1.5 shadow-sm shadow-slate-300"
              >
                <Ionicons name={item.icon as any} size={22} color="#FFFFFF" />
              </View>
              <Text className="text-[10px] text-slate-500 font-bold">{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Medical Record Selector Modal */}
      <Modal
        visible={isRecordModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsRecordModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View className="bg-white rounded-t-[40px] px-6 pt-6 pb-10 w-full max-h-[75%] absolute bottom-0 shadow-2xl">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-lg font-bold text-slate-900">Select Medical Record</Text>
                <Text className="text-xs text-slate-400 font-medium">Attach a report to send to the chat</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsRecordModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* List of files */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {DUMMY_MEDICAL_RECORDS.map((record) => (
                <TouchableOpacity
                  key={record.id}
                  onPress={() => handleSelectMedicalRecord(record)}
                  className="flex-row items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl mb-3"
                >
                  <View className="flex-row items-center flex-1 pr-4">
                    <View className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${
                      record.type === "pdf" ? "bg-red-50" : "bg-blue-50"
                    }`}>
                      <Ionicons
                        name={record.type === "pdf" ? "document-text" : "image"}
                        size={18}
                        color={record.type === "pdf" ? "#EF4444" : "#3B82F6"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-slate-800" numberOfLines={1}>
                        {record.name}
                      </Text>
                      <Text className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {record.date} • {record.size}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
});
