import React, { useState, useRef } from "react";
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
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import ChatInput from "../../components/ChatInput";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text?: string;
  imageUri?: string;
  fileName?: string;
  fileSize?: string;
  audioDuration?: string;
  transcription?: string;
  timestamp: string;
}

const STARTER_PROMPTS = [
  { text: "Lab Results", icon: "document-text", query: "Explain my blood test report and verify if values are normal.", attachMockFile: true },
  { text: "Headache guidance", icon: "head", query: "I have a sharp pain behind my eyes. What could it be?" },
  { text: "Skin issues", icon: "sparkles", query: "I have an itchy red rash on my hand. What could it be?", attachMockImage: true },
  { text: "Drug info", icon: "medkit", query: "What are the common side effects of Amoxicillin?" },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I am SmartDoctor AI, your virtual medical advisor. I can analyze symptoms, explain medical records, and answer health questions.\n\nFeel free to describe how you feel or attach lab reports, skin photos, or send voice messages.",
      timestamp: "Just now",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

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

    // Simulate AI Advisor Response
    setIsTyping(true);
    setTimeout(() => {
      let aiResponseText = "";
      let transcriptionText = "";

      if (image) {
        aiResponseText = "🔍 **Skin Concern Analysis**:\nBased on the photo uploaded, the symptoms resemble a localized case of contact dermatitis (mild skin rash). This can occur from contact with certain soaps, plants, or fabrics.\n\n**Guidelines:**\n• Wash the area with mild, fragrance-free soap.\n• Apply a cool compress to soothe itching.\n• Avoid scratching to prevent secondary infections.\n\nIf you experience spreading, pain, or pus, you should consult a Dermatologist. You can browse specialists in our **Doctors** tab.";
      } else if (file) {
        aiResponseText = "📄 **Lab Report Summary**:\nI have completed analyzing the medical document `" + file.name + "`:\n• **Hemoglobin**: 14.1 g/dL (Normal: 13.8–17.2 g/dL)\n• **White Blood Cells**: 11,200 /mcL (Slightly Elevated; normal is 4,500–11,000 /mcL)\n• **Platelet Count**: 260,000 /mcL (Normal)\n\n**Assessment:** The slight elevation in WBC might indicate a mild defense response to minor infection or inflammation. There are no alarming values here. Please schedule a consult to review these results in detail.";
      } else if (audio) {
        transcriptionText = "I've had a sore throat and a dry ticklish cough since yesterday.";
        aiResponseText = "🎙️ *(Transcribed Audio)*:\n\"" + transcriptionText + "\"\n\n**Symptom Guidance:**\nA sudden sore throat and dry cough can be caused by viral irritation or allergies. \n\n**Suggested Relief:**\n• Sip warm water with honey or lemon.\n• Try saline gargles to reduce throat swelling.\n• Use a humidifier to keep airways moist.\n\nIf symptoms are accompanied by high fever or shortness of breath, please consult a practitioner immediately.";
      } else {
        const query = text.toLowerCase();
        if (query.includes("headache") || query.includes("migraine")) {
          aiResponseText = "🤕 **Headache Advisory**:\nA headache can arise from dehydration, tension, stress, or eye strain.\n\n**Self-Care steps:**\n1. Drink 1-2 large glasses of water immediately.\n2. Rest in a dark, quiet room.\n3. Apply a cold compress to your forehead.\n\n⚠️ **Warning**: Seek immediate emergency care if your headache is sudden and extremely severe (thunderclap), or is accompanied by confusion, stiff neck, fever, or vision issues.";
        } else if (query.includes("fever") || query.includes("temperature")) {
          aiResponseText = "🌡️ **Fever Management**:\nA fever is your immune system fighting off an infection.\n\n**Actionable advice:**\n• Rest completely and drink plenty of fluids (water, oral rehydration salts).\n• Wear lightweight clothing and keep the room cool.\n• You may take Paracetamol to reduce temperature.\n\n🚨 **Consult a doctor if:**\n- Temperature exceeds 39.4°C (103°F).\n- Fever persists for more than 3 consecutive days.\n- You experience difficulty breathing or a stiff neck.";
        } else if (query.includes("chest pain") || query.includes("heart pain")) {
          aiResponseText = "🚨 **CRITICAL WARNING**:\nChest pain can be an indicator of a cardiovascular emergency such as a heart attack.\n\n**Please check for these signs:**\n- Pressure, squeezing, or fullness in the center of the chest.\n- Pain radiating to the jaw, neck, back, or arms.\n- Shortness of breath, sweating, or lightheadedness.\n\nIf you are experiencing any of these symptoms, **please call emergency services immediately** or have someone drive you to the nearest emergency clinic.";
        } else if (query.includes("amoxicillin") || query.includes("antibiotic")) {
          aiResponseText = "💊 **Medication Information**:\nAmoxicillin is a common penicillin-type antibiotic used to treat bacterial infections.\n\n**Common Side Effects:**\n• Nausea, vomiting, or mild diarrhea.\n• Yeast infection or oral thrush.\n\n⚠️ **Important Instructions:**\n- Complete the full course of treatment even if you feel better.\n- Stop taking it immediately and seek emergency care if you experience allergy signs: skin hives, swelling of face/lips, or breathing difficulty.";
        } else {
          aiResponseText = "Thanks for sharing your symptoms. Based on my analysis, these symptoms can be managed with rest and hydration. \n\nHowever, to get a definitive diagnosis and treatment plan, I highly recommend scheduling a consultation with one of our certified specialists in the **Doctors** tab.";
        }
      }

      const aiMsg: Message = {
        id: `msg-${Date.now()}`,
        sender: "ai",
        text: aiResponseText,
        transcription: transcriptionText || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1500);
  };

  const handleStarterPrompt = (prompt: typeof STARTER_PROMPTS[0]) => {
    let mockAttach: any = {};
    if (prompt.attachMockImage) {
      mockAttach = { image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=300" };
    } else if (prompt.attachMockFile) {
      mockAttach = { file: { name: "Blood_Test_Report.pdf", size: "1.4 MB" } };
    }
    handleSend(prompt.query, mockAttach);
  };

  const handleClearChat = () => {
    Alert.alert("Clear Conversation", "Are you sure you want to clear all messages?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setMessages([
            {
              id: "welcome",
              sender: "ai",
              text: "Hello! I am SmartDoctor AI, your virtual medical advisor. I can analyze symptoms, explain medical records, and answer health questions.\n\nFeel free to describe how you feel or attach lab reports, skin photos, or send voice messages.",
              timestamp: "Just now",
            },
          ]);
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-2 pb-4 bg-white border-b border-slate-100 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-blue-500 rounded-2xl items-center justify-center mr-3 relative">
            <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white" />
          </View>
          <View>
            <Text className="text-base font-extrabold text-slate-900 leading-snug">SmartDoctor AI</Text>
            <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Medical Assistant</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleClearChat}
          className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 items-center justify-center"
        >
          <Ionicons name="trash-outline" size={16} color="#64748B" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Messages Scroll Area */}
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
                {/* AI Avatar */}
                {!isUser && (
                  <View className="w-8 h-8 bg-blue-500 rounded-xl items-center justify-center mr-2 mt-1 shadow-sm">
                    <Ionicons name="chatbubble-ellipses" size={16} color="#FFFFFF" />
                  </View>
                )}

                <View className="max-w-[78%]">
                  {/* Message Bubble Container */}
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

                    {/* Render Audio voice attachment */}
                    {msg.audioDuration && (
                      <View className={`flex-row items-center py-1.5 px-2 rounded-2xl mb-1 ${
                        isUser ? "bg-blue-600/40" : "bg-blue-50/50"
                      }`} style={{ width: 220 }}>
                        <TouchableOpacity className={`w-8 h-8 rounded-full items-center justify-center ${
                          isUser ? "bg-white/20" : "bg-blue-500"
                        }`}>
                          <Ionicons name="play" size={14} color="#FFFFFF" style={{ marginLeft: 2 }} />
                        </TouchableOpacity>
                        
                        {/* Fake Waveform dots */}
                        <View className="flex-row items-center flex-1 mx-3 gap-0.5">
                          {[2, 3, 5, 2, 4, 3, 5, 4, 2, 5, 3, 2, 4, 5, 3, 2].map((h, i) => (
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

          {/* AI Typing Loader Indicator */}
          {isTyping && (
            <View className="flex-row mb-5 justify-start">
              <View className="w-8 h-8 bg-blue-500 rounded-xl items-center justify-center mr-2 mt-1 shadow-sm">
                <Ionicons name="chatbubble-ellipses" size={16} color="#FFFFFF" />
              </View>
              <View className="bg-white border border-slate-100 rounded-3xl rounded-tl-none p-4 shadow-sm shadow-slate-100/40">
                <View className="flex-row items-center gap-1.5 py-1 px-2">
                  <View className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <View className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <View className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </View>
              </View>
            </View>
          )}

          {/* Starter prompt shortcuts (Shown only when welcome message is the only one) */}
          {messages.length === 1 && !isTyping && (
            <View className="mt-8">
              <Text className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Try asking</Text>
              <View className="flex-row flex-wrap justify-between gap-3">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleStarterPrompt(prompt)}
                    className="w-[48%] bg-white border border-slate-100 rounded-3xl p-4 shadow-sm shadow-slate-100/30 flex-row items-center"
                  >
                    <View className="w-8 h-8 bg-blue-50 rounded-xl items-center justify-center mr-3">
                      <Ionicons name={prompt.icon as any} size={16} color="#1D4ED8" />
                    </View>
                    <Text className="text-xs font-bold text-slate-700 flex-1 leading-snug" numberOfLines={2}>
                      {prompt.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* WhatsApp Reusable Chat Input Component */}
        <ChatInput
          placeholder="Describe your symptoms or ask a health question..."
          onSend={handleSend}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
