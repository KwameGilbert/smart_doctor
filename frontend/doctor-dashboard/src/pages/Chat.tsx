import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, messageAPI, consultationAPI } from '../services/api';
import socketService from '../services/socket';
import { Modal } from '../components/Modal';
import { 
  Send, 
  CheckCheck, 
  Play, 
  Check, 
  FileText, 
  ClipboardList, 
  AlertCircle,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

interface ChatProps {
  initialConsultationId: string | null;
  onClearInitialId: () => void;
}

export const Chat: React.FC<ChatProps> = ({ initialConsultationId, onClearInitialId }) => {
  const { user } = useAuth();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeConsultations, setActiveConsultations] = useState<any[]>([]);
  const [selectedConsult, setSelectedConsult] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [patientTyping, setPatientTyping] = useState(false);
  
  // Notes Modal state
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isSubmittingNotes, setIsSubmittingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  const fetchConsultations = async () => {
    try {
      const response: any = await appointmentAPI.list();
      if (response && response.data) {
        const list = response.data;
        const consultAppts = list.filter((a: any) => a.consultation != null);
        setAppointments(consultAppts);

        const mapped = consultAppts.map((a: any) => ({
          id: a.consultation.id,
          appointmentId: a.id,
          status: a.status,
          dateTime: a.dateTime,
          reason: a.reason,
          patientId: a.patientId,
          patientFirstName: a.patientFirstName,
          patientLastName: a.patientLastName,
          patientAvatar: a.patientAvatar,
          startedAt: a.consultation.startedAt,
          endedAt: a.consultation.endedAt,
          notes: a.consultation.notes,
          diagnosis: a.consultation.diagnosis,
          recommendations: a.consultation.recommendations
        }));
        
        setActiveConsultations(mapped);

        if (initialConsultationId) {
          const match = mapped.find((c: any) => c.id === initialConsultationId);
          if (match) {
            setSelectedConsult(match);
          }
          onClearInitialId();
        }
      }
    } catch (err) {
      console.error('Error fetching consultations:', err);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, [initialConsultationId]);

  useEffect(() => {
    if (!selectedConsult) return;
    
    const fetchMessages = async () => {
      try {
        const response: any = await messageAPI.getMessages(selectedConsult.id);
        if (response && response.data) {
          setMessages(response.data.reverse());
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();

    // Setup socket listeners
    socketService.emit('join_room', { consultationId: selectedConsult.id });

    const handleNewMessage = (msg: any) => {
      if (msg.consultationId === selectedConsult.id) {
        setMessages((prev: any[]) => [...prev, msg]);
        if (msg.senderId !== user?.id) {
          socketService.emit('read_messages', {
            consultationId: selectedConsult.id,
            senderId: msg.senderId
          });
        }
      }
    };

    const handlePatientTyping = (data: any) => {
      if (data.consultationId === selectedConsult.id && data.senderId !== user?.id) {
        setPatientTyping(data.isTyping);
      }
    };

    const handleMessagesRead = (data: any) => {
      if (data.consultationId === selectedConsult.id) {
        setMessages((prev: any[]) => 
          prev.map((m: any) => m.senderId === user?.id ? { ...m, status: 'READ' } : m)
        );
      }
    };

    socketService.on('new_message', handleNewMessage);
    socketService.on('typing_status', handlePatientTyping);
    socketService.on('messages_read', handleMessagesRead);

    // Mark existing as read
    const patientAppt = appointments.find(a => a.consultation.id === selectedConsult.id);
    if (patientAppt) {
      socketService.emit('read_messages', {
        consultationId: selectedConsult.id,
        senderId: patientAppt.patientId
      });
    }

    return () => {
      socketService.off('new_message', handleNewMessage);
      socketService.off('typing_status', handlePatientTyping);
      socketService.off('messages_read', handleMessagesRead);
    };
  }, [selectedConsult]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, patientTyping]);

  const handleStartConsultation = async () => {
    if (!selectedConsult) return;
    try {
      const response: any = await consultationAPI.start(selectedConsult.id);
      if (response) {
        setSelectedConsult((prev: any) => ({
          ...prev,
          startedAt: response.data?.startedAt || new Date().toISOString()
        }));
        fetchConsultations();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start consultation session.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedConsult) return;

    const textToSend = newMessageText.trim();
    setNewMessageText('');
    
    // Stop typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    handleTypingEvent(false);

    try {
      const response: any = await messageAPI.sendMessage(selectedConsult.id, { content: textToSend });
      if (response && response.data) {
        // Handled chronologically by state append
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleTypingEvent = (typing: boolean) => {
    if (!selectedConsult || !user) return;
    
    const appt = appointments.find(a => a.consultation.id === selectedConsult.id);
    if (!appt) return;

    setIsTyping(typing);
    socketService.emit('typing', {
      consultationId: selectedConsult.id,
      recipientId: appt.patientId,
      isTyping: typing
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessageText(e.target.value);

    if (!isTyping) {
      handleTypingEvent(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingEvent(false);
    }, 2500);
  };

  const handleEndConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsult) return;
    
    setIsSubmittingNotes(true);
    setNotesError(null);

    try {
      await consultationAPI.updateNotes(selectedConsult.id, notes, diagnosis, recommendations);
      await consultationAPI.end(selectedConsult.id);
      
      setIsEndModalOpen(false);
      setDiagnosis('');
      setNotes('');
      setRecommendations('');
      
      await fetchConsultations();
      
      const updatedConsult = activeConsultations.find(c => c.id === selectedConsult.id);
      if (updatedConsult) {
        setSelectedConsult({
          ...updatedConsult,
          endedAt: new Date().toISOString(),
          notes,
          diagnosis,
          recommendations
        });
      } else {
        setSelectedConsult(null);
      }
    } catch (err: any) {
      setNotesError(err.message || 'Failed to submit consultation report.');
    } finally {
      setIsSubmittingNotes(false);
    }
  };

  const formatMessageTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (first: string, last: string) => {
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="flex-1 bg-slate-50 flex overflow-hidden h-full">
      
      {/* 1. Sidebar Consultation Threads */}
      <aside className="w-80 border-r border-slate-200 flex flex-col flex-shrink-0 bg-white">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-bold font-outfit text-slate-800">Active Sessions</h3>
          <p className="text-xs text-slate-400 mt-1">Select a patient to begin consulting</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {activeConsultations.length === 0 ? (
            <div className="text-center p-6 text-xs text-slate-400">
              No active consultation threads available. Confirm booked slots first.
            </div>
          ) : (
            activeConsultations.map((consult) => {
              const isSelected = selectedConsult?.id === consult.id;
              return (
                <div
                  key={consult.id}
                  onClick={() => setSelectedConsult(consult)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all duration-150 ${
                    isSelected 
                      ? 'bg-blue-50 border border-blue-100 text-blue-700' 
                      : 'hover:bg-slate-50 border border-transparent text-slate-600'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold font-outfit">
                    {getInitials(consult.patientFirstName, consult.patientLastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="text-xs font-bold truncate text-slate-800">
                        {consult.patientFirstName} {consult.patientLastName}
                      </h4>
                    </div>
                    <p className="text-[10px] truncate text-slate-400">
                      Reason: {consult.reason || 'Consultation'}
                    </p>
                    {consult.endedAt ? (
                      <span className="inline-block mt-1 text-[9px] font-bold text-slate-400 uppercase">Completed</span>
                    ) : consult.startedAt ? (
                      <span className="inline-block mt-1 text-[9px] font-bold text-emerald-600 uppercase animate-pulse">Active Session</span>
                    ) : (
                      <span className="inline-block mt-1 text-[9px] font-bold text-amber-500 uppercase">Not Started</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* 2. Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {selectedConsult ? (
          <>
            {/* Thread Header */}
            <div className="h-[68px] border-b border-slate-200 px-6 flex items-center justify-between bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold font-outfit">
                  {getInitials(selectedConsult.patientFirstName, selectedConsult.patientLastName)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {selectedConsult.patientFirstName} {selectedConsult.patientLastName}
                  </h3>
                  {patientTyping ? (
                    <span className="text-[10px] text-blue-500 animate-pulse font-medium">Patient is typing...</span>
                  ) : selectedConsult.endedAt ? (
                    <span className="text-[10px] text-slate-400 font-medium">Consultation ended</span>
                  ) : selectedConsult.startedAt ? (
                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                      <span>Session Live</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-500 font-medium">Ready to start</span>
                  )}
                </div>
              </div>

              {/* Header Actions */}
              <div>
                {!selectedConsult.startedAt && (
                  <button
                    onClick={handleStartConsultation}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                  >
                    <Play size={13} />
                    <span>Start Consultation</span>
                  </button>
                )}
                {selectedConsult.startedAt && !selectedConsult.endedAt && (
                  <button
                    onClick={() => {
                      setDiagnosis(selectedConsult.diagnosis || '');
                      setNotes(selectedConsult.notes || '');
                      setRecommendations(selectedConsult.recommendations || '');
                      setIsEndModalOpen(true);
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check size={13} />
                    <span>End Consultation</span>
                  </button>
                )}
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col bg-slate-100/50">
              
              {/* If Session hasn't started */}
              {!selectedConsult.startedAt && (
                <div className="max-w-md mx-auto my-auto text-center p-8 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                    <Play size={24} className="text-amber-500 animate-pulse" />
                  </div>
                  <h4 className="font-bold text-slate-800 font-outfit text-base">Start the Consultation</h4>
                  <p className="text-xs text-slate-500 mt-2 px-2 leading-relaxed">
                    This consultation has not been started yet. Please click the button below to initiate the session, 
                    which allows real-time messaging and opens the channel for the patient.
                  </p>
                  <button
                    onClick={handleStartConsultation}
                    className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm mt-5 cursor-pointer transition-colors"
                  >
                    Start Consultation Now
                  </button>
                </div>
              )}

              {/* If Session is Live or Finished */}
              {selectedConsult.startedAt && (
                <>
                  {/* Status Banner */}
                  <div className="text-center">
                    <span className="inline-block text-[10px] text-slate-400 bg-white border border-slate-200 px-3.5 py-1 rounded-full font-medium shadow-sm">
                      Consultation started on {new Date(selectedConsult.startedAt).toLocaleDateString()} at {new Date(selectedConsult.startedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>

                  {/* Messages Bubble List */}
                  <div className="flex-grow flex flex-col gap-3 justify-end">
                    {messages.length === 0 ? (
                      <div className="text-center p-8 text-slate-400 text-xs my-auto flex flex-col items-center">
                        <HelpCircle size={20} className="text-slate-300 mb-2" />
                        <span>No messages yet. Send a message to welcome the patient!</span>
                      </div>
                    ) : (
                      messages.map((msg, index) => {
                        const isDoctor = msg.senderId === user?.id;
                        return (
                          <div
                            key={msg.id || index}
                            className={`max-w-[65%] p-3 px-4 rounded-2xl relative text-sm word-break flex flex-col ${
                              isDoctor 
                                ? 'bg-blue-600 text-white align-self-end rounded-br-none shadow-sm' 
                                : 'bg-white border border-slate-200 text-slate-800 align-self-start rounded-bl-none shadow-sm'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <div className={`flex items-center justify-end gap-1 text-[9px] mt-1.5 ${
                              isDoctor ? 'text-blue-100' : 'text-slate-400'
                            }`}>
                              <span>{formatMessageTime(msg.createdAt)}</span>
                              {isDoctor && (
                                <span className={msg.status === 'READ' ? 'text-emerald-300' : 'text-blue-200'}>
                                  <CheckCheck size={11} />
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    {patientTyping && (
                      <div className="px-3.5 py-2.5 rounded-2xl align-self-start bg-slate-50 border border-slate-200 text-xs text-slate-400 shadow-sm animate-pulse">
                        Patient typing...
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </>
              )}
            </div>

            {/* End session view (reports review) */}
            {selectedConsult.endedAt && (
              <div className="bg-white border-t border-slate-200 p-5 shadow-inner">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <ClipboardList size={14} className="text-emerald-600" />
                  <span>Consultation Report (Completed)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                    <span className="font-semibold text-slate-800 block mb-1">Diagnosis</span>
                    <p className="line-clamp-2">{selectedConsult.diagnosis || 'No diagnosis written.'}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                    <span className="font-semibold text-slate-800 block mb-1">Clinical Notes</span>
                    <p className="line-clamp-2">{selectedConsult.notes || 'No notes written.'}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                    <span className="font-semibold text-slate-800 block mb-1">Recommendations</span>
                    <p className="line-clamp-2">{selectedConsult.recommendations || 'No recommendations written.'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Message input bar */}
            {selectedConsult.startedAt && !selectedConsult.endedAt && (
              <div className="p-4 bg-white border-t border-slate-200 shadow-sm">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                  <textarea
                    rows={1}
                    value={newMessageText}
                    onChange={handleInputChange}
                    placeholder="Type medical instructions, prescription details, or follow-ups..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none max-h-24"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!newMessageText.trim()}
                    className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center cursor-pointer transition disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare size={36} className="text-slate-300 mb-3" />
            <h4 className="font-bold text-slate-700 font-outfit text-base">Select a Consultation</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Choose an active patient from the left panel to review message threads or start consultations.
            </p>
          </div>
        )}

        {/* Ending Consultation Modal */}
        {selectedConsult && (
          <Modal
            isOpen={isEndModalOpen}
            onClose={() => setIsEndModalOpen(false)}
            title="Complete Consultation Session"
          >
            <form onSubmit={handleEndConsultation} className="space-y-4 text-slate-600 text-sm">
              <p className="text-xs text-slate-400 leading-relaxed">
                Please document clinical notes, diagnosis, and medical advice before completing this session. 
                Ending the consultation will finalize the appointment status to <span className="text-slate-800 font-semibold">COMPLETED</span>.
              </p>

              {notesError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center gap-2 text-xs">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{notesError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Diagnosis *</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Mild Hypertension, Bacterial Infection"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                  disabled={isSubmittingNotes}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Clinical Notes *</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Clinical observations, patient history findings, physical assessments..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  required
                  disabled={isSubmittingNotes}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Recommendations & Prescription</label>
                <textarea
                  rows={3}
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  placeholder="Dosage schedules, diet advice, follow-up timelines..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  disabled={isSubmittingNotes}
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-5">
                <button
                  type="button"
                  onClick={() => setIsEndModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                  disabled={isSubmittingNotes}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNotes}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  {isSubmittingNotes ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <FileText size={14} />
                      <span>Submit Report & End</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </Modal>
        )}

      </main>

    </div>
  );
};

export default Chat;
