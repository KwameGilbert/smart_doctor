import React from 'react';
import { LayoutDashboard, CalendarDays, MessageSquare, LogOut, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { logout, user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: CalendarDays },
    { id: 'chat', label: 'Consultations', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen flex-shrink-0 relative z-10 shadow-sm">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 flex-shrink-0 shadow-sm">
          <Activity size={20} />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-800 leading-tight font-outfit">Smart Doctor</h1>
          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Doctor Portal</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <div
              key={item.id}
              role="button"
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer select-none border ${
                isActive
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Footer Profile Box */}
      <div className="p-4 border-t border-slate-100 space-y-3.5 bg-slate-50/50">
        {user && (
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0 shadow-sm">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-outfit uppercase">{user.firstName[0]}{user.lastName[0]}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate font-outfit">
                Dr. {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
        
        <div
          role="button"
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer select-none"
        >
          <LogOut size={16} className="flex-shrink-0" />
          <span>Sign Out</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
