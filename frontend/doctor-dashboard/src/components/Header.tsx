import React from 'react';
import { Calendar } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const getTodayDateString = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date().toLocaleDateString(undefined, options);
  };

  return (
    <header className="h-[76px] bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
      {/* Title */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-800 font-outfit capitalize">{title}</h2>
      </div>

      {/* Date & Details */}
      <div className="flex items-center gap-6">
        {/* Calendar widget */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
          <Calendar size={14} className="text-blue-500" />
          <span>{getTodayDateString()}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
