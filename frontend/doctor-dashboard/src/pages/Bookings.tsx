import React, { useState, useEffect } from 'react';
import { appointmentAPI } from '../services/api';
import { Modal } from '../components/Modal';
import { 
  Search, 
  Calendar, 
  Clock, 
  FileText, 
  Check, 
  X, 
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Phone,
  User,
  HeartPulse
} from 'lucide-react';

interface BookingsProps {
  onNavigateToChat: (consultationId: string) => void;
}

export const Bookings: React.FC<BookingsProps> = ({ onNavigateToChat }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  
  // Detail Modal state
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const tabs = [
    { id: 'ALL', label: 'All Slots' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'CONFIRMED', label: 'Confirmed' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ];

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response: any = await appointmentAPI.list();
      if (response && response.data) {
        setAppointments(response.data);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    let list = [...appointments];

    if (activeTab !== 'ALL') {
      list = list.filter(a => a.status === activeTab);
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      list = list.filter(a => {
        const fullName = `${a.patientFirstName || ''} ${a.patientLastName || ''}`.toLowerCase();
        return fullName.includes(search) || (a.reason && a.reason.toLowerCase().includes(search));
      });
    }

    setFilteredAppointments(list);
  }, [appointments, activeTab, searchTerm]);

  const handleOpenDetail = async (apptId: string) => {
    setActionError(null);
    try {
      const response: any = await appointmentAPI.getDetails(apptId);
      if (response && response.data) {
        setSelectedAppt(response.data);
        setIsDetailOpen(true);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to fetch appointment details.');
    }
  };

  const handleConfirm = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsSubmittingAction(true);
    setActionError(null);
    try {
      await appointmentAPI.confirm(id);
      await fetchAppointments();
      setIsDetailOpen(false);
    } catch (err: any) {
      setActionError(err.message || 'Failed to confirm appointment.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleReject = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsSubmittingAction(true);
    setActionError(null);
    try {
      await appointmentAPI.reject(id);
      await fetchAppointments();
      setIsDetailOpen(false);
    } catch (err: any) {
      setActionError(err.message || 'Failed to reject appointment.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateAge = (dobString: string) => {
    if (!dobString) return 'N/A';
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        
        {/* Toolbar: Tabs & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm overflow-x-auto self-start gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full lg:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search patient or reason..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
            />
          </div>
        </div>

        {/* Content list */}
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Calendar size={36} className="text-slate-300 mb-3" />
            <h4 className="font-bold text-slate-700 font-outfit text-base">No appointments found</h4>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              We couldn't find any appointment matching this search criteria.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredAppointments.map((appt) => (
                    <tr 
                      key={appt.id}
                      onClick={() => handleOpenDetail(appt.id)}
                      className="hover:bg-slate-50/50 cursor-pointer transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold font-outfit uppercase">
                            {appt.patientFirstName ? `${appt.patientFirstName[0]}${appt.patientLastName[0]}` : 'P'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">
                              {appt.patientFirstName} {appt.patientLastName}
                            </div>
                            <div className="text-[10px] text-slate-400">ID: {appt.patientId.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <Calendar size={13} className="text-blue-500" />
                          <span>{formatDate(appt.dateTime)}</span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Clock size={13} className="text-slate-400" />
                          <span>{formatTime(appt.dateTime)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-slate-500">
                        {appt.reason || 'General health consultation.'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            appt.status === 'CONFIRMED'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : appt.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : appt.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {appt.status === 'PENDING' && (
                            <>
                              <button
                                onClick={(e) => handleConfirm(appt.id, e)}
                                disabled={isSubmittingAction}
                                className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center border border-emerald-100 cursor-pointer transition-all"
                                title="Confirm Slot"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={(e) => handleReject(appt.id, e)}
                                disabled={isSubmittingAction}
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center border border-red-100 cursor-pointer transition-all"
                                title="Reject Slot"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                          {appt.status === 'CONFIRMED' && appt.consultation?.id && (
                            <button
                              onClick={() => onNavigateToChat(appt.consultation.id)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                            >
                              <MessageSquare size={12} />
                              <span>Open Chat</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenDetail(appt.id)}
                            className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center border border-slate-200 cursor-pointer transition-all"
                            title="View Details"
                          >
                            <ExternalLink size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Modal popup */}
        {selectedAppt && (
          <Modal 
            isOpen={isDetailOpen} 
            onClose={() => setIsDetailOpen(false)}
            title="Appointment Details"
          >
            <div className="space-y-5 text-sm text-slate-600">
              {actionError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center gap-2 text-xs">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Patient Core Header */}
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg font-outfit uppercase">
                  {selectedAppt.patientFirstName ? `${selectedAppt.patientFirstName[0]}${selectedAppt.patientLastName[0]}` : 'P'}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800 font-outfit">
                    {selectedAppt.patientFirstName} {selectedAppt.patientLastName}
                  </h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <User size={12} className="text-slate-400" />
                      <span>{selectedAppt.patientEmail || 'No Email'}</span>
                    </span>
                    {selectedAppt.phoneNumber && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-slate-400" />
                        <span>{selectedAppt.phoneNumber}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Date</label>
                  <span className="text-sm font-semibold text-slate-800 block mt-0.5">{formatDate(selectedAppt.dateTime)}</span>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Time Slot</label>
                  <span className="text-sm font-semibold text-slate-800 block mt-0.5">{formatTime(selectedAppt.dateTime)}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Reason for Visit</label>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-slate-700 mt-1 flex items-start gap-2.5">
                  <FileText size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>{selectedAppt.reason || 'General health assessment.'}</span>
                </div>
              </div>

              {/* Patient Profile Details */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h5 className="font-bold text-slate-800 font-outfit text-sm flex items-center gap-1.5">
                  <HeartPulse size={16} className="text-red-500" />
                  <span>Patient Medical Profile</span>
                </h5>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Age / Gender</span>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">
                      {selectedAppt.dob ? `${calculateAge(selectedAppt.dob)} Yrs` : 'N/A'} / {selectedAppt.gender || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Blood Group</span>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">{selectedAppt.bloodGroup || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block font-medium">Allergies</span>
                  <p className="text-sm text-slate-600 mt-0.5 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                    {selectedAppt.allergies || 'No allergies reported.'}
                  </p>
                </div>

                {selectedAppt.emergencyContactName && (
                  <div className="bg-rose-50/50 border border-rose-100 p-3 rounded-xl">
                    <span className="text-[10px] text-rose-500 block font-bold uppercase tracking-wider">Emergency Contact</span>
                    <p className="text-sm font-semibold text-rose-900 mt-0.5">
                      {selectedAppt.emergencyContactName} ({selectedAppt.emergencyContactPhone || 'No Phone'})
                    </p>
                  </div>
                )}
              </div>

              {/* Booking Actions inside detail modal */}
              {selectedAppt.status === 'PENDING' && (
                <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => handleReject(selectedAppt.id)}
                    disabled={isSubmittingAction}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                  >
                    Reject Appointment
                  </button>
                  <button
                    onClick={() => handleConfirm(selectedAppt.id)}
                    disabled={isSubmittingAction}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow transition cursor-pointer"
                  >
                    Confirm Appointment
                  </button>
                </div>
              )}

              {selectedAppt.status === 'CONFIRMED' && selectedAppt.consultation?.id && (
                <div className="flex justify-end border-t border-slate-100 pt-4">
                  <button
                    onClick={() => {
                      setIsDetailOpen(false);
                      onNavigateToChat(selectedAppt.consultation.id);
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <MessageSquare size={14} />
                    <span>Launch Consultation Chat</span>
                  </button>
                </div>
              )}
            </div>
          </Modal>
        )}

      </div>
    </div>
  );
};

export default Bookings;
