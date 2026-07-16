import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import {
  CalendarDays,
  DollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
  UserCheck,
  ArrowRight,
  Users
} from 'lucide-react';

interface DashboardProps {
  onNavigateToTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToTab }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalEarnings: 0,
    completed: 0,
    pending: 0,
    uniquePatients: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [earningsTrend, setEarningsTrend] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response: any = await userAPI.getHomeDashboard();
        if (response && response.data) {
          const data = response.data;
          setStats(
            data.stats || {
              totalBookings: 0,
              totalEarnings: 0,
              completed: 0,
              pending: 0,
              uniquePatients: 0,
            }
          );
          setTodayAppointments(data.todayAppointments || []);
          setEarningsTrend(data.earningsTrend || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const formatSlotTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  const getChartPoints = () => {
    const points =
      earningsTrend.length > 0
        ? earningsTrend
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => ({ day: d, value: 0 }));

    const maxVal = Math.max(...points.map((p: any) => p.value), 200);
    const h = 160;
    const w = 500;
    const pad = 40;

    const pts = points.map((p: any, i: number) => ({
      label: p.day,
      value: p.value,
      x: pad + (i * (w - pad * 2)) / (points.length - 1),
      y: h - pad - (p.value / maxVal) * (h - pad * 2),
    }));

    return { pts, maxVal, w, h, pad };
  };

  const { pts, maxVal, w, h } = getChartPoints();
  const linePath = pts.reduce((path: string, p: any, i: number) =>
    i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`, '');
  const areaPath =
    pts.length > 0
      ? `${linePath} L ${pts[pts.length - 1].x} ${h - 40} L ${pts[0].x} ${h - 40} Z`
      : '';

  const metricCards = [
    {
      label: 'Total Earnings',
      value: `$${stats.totalEarnings.toFixed(2)}`,
      sub: '+12.5% this week',
      subColor: 'text-emerald-600',
      icon: DollarSign,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      border: 'border-slate-200',
    },
    {
      label: 'Total Appointments',
      value: stats.totalBookings,
      sub: 'All booked slots',
      subColor: 'text-slate-400',
      icon: CalendarDays,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      border: 'border-slate-200',
    },
    {
      label: 'Completed',
      value: stats.completed,
      sub: 'Consultations done',
      subColor: 'text-emerald-600',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      border: 'border-slate-200',
    },
    {
      label: 'Pending',
      value: stats.pending,
      sub: 'Requires action',
      subColor: 'text-amber-600',
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      border: 'border-slate-200',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Welcome strip */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-outfit">
            Good morning, Dr. {user?.firstName} 👋
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Here's what's happening with your practice today.</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`bg-white rounded-2xl border ${card.border} p-5 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow`}
              >
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-800 font-outfit mt-1">{card.value}</p>
                  <p className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${card.subColor}`}>
                    <TrendingUp size={11} />
                    {card.sub}
                  </p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={20} className={card.iconColor} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Chart + Today's Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Earnings Chart */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-800 font-outfit text-base">Earnings Analytics</h3>
                <p className="text-xs text-slate-400 mt-0.5">Last 7 days earnings progression</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg">
                Week View
              </span>
            </div>

            {/* SVG chart */}
            <div className="w-full" style={{ height: '180px' }}>
              <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
                <defs>
                  <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                {[40, 80, 120].map((y) => (
                  <line key={y} x1="40" y1={y} x2={w - 40} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                ))}
                {/* Y labels */}
                <text x="32" y="44" textAnchor="end" fontSize="9" fill="#94a3b8">${maxVal.toFixed(0)}</text>
                <text x="32" y="84" textAnchor="end" fontSize="9" fill="#94a3b8">${(maxVal / 2).toFixed(0)}</text>
                <text x="32" y="124" textAnchor="end" fontSize="9" fill="#94a3b8">$0</text>
                {/* Area fill */}
                {areaPath && <path d={areaPath} fill="url(#chart-grad)" />}
                {/* Line */}
                {linePath && <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                {/* Dots + labels */}
                {pts.map((p: any, i: number) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="4" fill="#3b82f6" />
                    <circle cx={p.x} cy={p.y} r="2.5" fill="white" />
                    <text x={p.x} y={h - 14} textAnchor="middle" fontSize="9" fill="#94a3b8">{p.label}</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 font-outfit text-base">Today's Schedule</h3>
                <p className="text-xs text-slate-400 mt-0.5">Appointments for today</p>
              </div>
              <button
                onClick={() => onNavigateToTab('bookings')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer bg-transparent border-none"
              >
                <span>All Slots</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[230px]">
              {todayAppointments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <UserCheck size={20} className="text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">No appointments today</p>
                </div>
              ) : (
                todayAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold font-outfit uppercase">
                        {appt.patientFirstName ? `${appt.patientFirstName[0]}${appt.patientLastName[0]}` : 'P'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700 leading-tight">
                          {appt.patientFirstName} {appt.patientLastName}
                        </p>
                        <p className="text-[10px] text-blue-500 font-medium">{formatSlotTime(appt.dateTime)}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        appt.status === 'CONFIRMED'
                          ? 'bg-blue-100 text-blue-700'
                          : appt.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : appt.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Unique patients stat */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <Users size={15} className="text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Unique Patients</p>
                <p className="text-sm font-bold text-slate-700">{stats.uniquePatients}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
