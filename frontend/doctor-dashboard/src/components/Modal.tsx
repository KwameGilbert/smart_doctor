import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-xl relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h3 className="text-lg font-bold text-slate-800 font-outfit">{title}</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer text-xl border-none bg-transparent"
          >
            &times;
          </button>
        </div>

        {/* Content Body */}
        <div className="text-slate-600">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
