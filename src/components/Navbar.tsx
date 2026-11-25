'use client';

import React from 'react';
import { AuthUser } from '@/types';
import { 
  Ticket, 
  Sparkles, 
  User, 
  ShieldCheck, 
  Settings, 
  LogOut
} from 'lucide-react';

interface NavbarProps {
  currentUser: AuthUser;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onOpenSettings
}) => {
  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
              isAdmin 
                ? 'bg-gradient-to-tr from-indigo-700 via-purple-700 to-indigo-800 shadow-indigo-500/20' 
                : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 shadow-blue-500/20'
            }`}>
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Ticketing Trans Hamana</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                  isAdmin 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {isAdmin ? 'ADMIN IT' : 'USER'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 hidden sm:flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> AI Triage Active
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {isAdmin ? 'Panel Kontrol Manajemen & Penanganan Tiket' : 'Portal Layanan Bantuan Karyawan'}
              </p>
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3">
            
            {/* AI Settings Button */}
            <button
              onClick={onOpenSettings}
              title="Pengaturan AI & Model"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/80 flex items-center gap-1.5 text-xs font-medium"
            >
              <Settings className="w-4 h-4 text-slate-600" />
              <span className="hidden md:inline">Pengaturan AI</span>
            </button>

            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

            {/* Profile Avatar & Name */}
            <div className="flex items-center gap-2.5 pl-1">
              <img
                src={currentUser.avatar}
                alt={currentUser.nama}
                className="w-8 h-8 rounded-full object-cover border border-slate-300 shadow-sm"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.nama}
                </p>
                <p className="text-[11px] text-slate-500 capitalize">
                  {isAdmin ? 'Administrator IT' : 'Karyawan / User'}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="Keluar dari akun"
              className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200/60 flex items-center gap-1 text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
