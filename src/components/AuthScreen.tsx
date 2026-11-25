'use client';

import React, { useState } from 'react';
import { AuthUser, UserRole } from '@/types';
import { 
  Ticket, 
  Sparkles, 
  User, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle,
  RotateCw,
  KeyRound,
  UserPlus,
  Briefcase,
  CheckCircle2
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  // Tab pilihan role: 'user' atau 'admin'
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  
  // Mode User: 'login' atau 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login Form input
  const [email, setEmail] = useState('user@perusahaan.co.id');
  const [password, setPassword] = useState('user123');

  // Register Form input (User Baru / Gmail)
  const [regNama, setRegNama] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regJabatan, setRegJabatan] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setAuthMode('login');
    setErrorMsg('');
    setSuccessMsg('');
    if (role === 'user') {
      setEmail('user@perusahaan.co.id');
      setPassword('user123');
    } else {
      setEmail('admin@perusahaan.co.id');
      setPassword('admin123');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login gagal.');
      }

      onLoginSuccess(data.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: regNama,
          email: regEmail,
          password: regPassword,
          jabatan: regJabatan
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registrasi gagal.');
      }

      setSuccessMsg(`Pendaftaran berhasil! Mengalihkan ke portal Anda...`);
      setTimeout(() => {
        onLoginSuccess(data.data);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mendaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Glow Orbs */}
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 ${
        selectedRole === 'admin' ? 'bg-teal-600' : 'bg-emerald-600'
      }`} />
      <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 ${
        selectedRole === 'admin' ? 'bg-emerald-700' : 'bg-teal-500'
      }`} />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Logo Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-500/30 mb-3">
            <Ticket className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            Ticketing Trans Hamana
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-300" /> AI
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sistem Manajemen Tiket Helpdesk Berbasis AI
          </p>
        </div>

        {/* Tab Pilihan Login: User vs Admin */}
        <div className="bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 flex items-center mb-6 shadow-lg backdrop-blur-md">
          <button
            type="button"
            onClick={() => handleRoleTabChange('user')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              selectedRole === 'user'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Portal Pengguna</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              selectedRole === 'admin'
                ? 'bg-gradient-to-r from-teal-700 to-emerald-800 text-white shadow-md shadow-teal-700/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Portal Administrator</span>
          </button>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-3xl p-7 shadow-2xl border border-slate-100">
          
          {/* Header Title */}
          <div className="mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`p-1.5 rounded-lg text-white ${
                  selectedRole === 'admin' ? 'bg-teal-700' : 'bg-emerald-600'
                }`}>
                  {selectedRole === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedRole === 'admin'
                    ? 'Login Administrator IT'
                    : authMode === 'login'
                    ? 'Login Pengguna / User'
                    : 'Daftar Akun Pengguna Baru'}
                </h2>
              </div>

              {/* Sub-toggle untuk User: Masuk vs Daftar */}
              {selectedRole === 'user' && (
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMsg('');
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      authMode === 'login' ? 'bg-white text-emerald-700 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setErrorMsg('');
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      authMode === 'register' ? 'bg-white text-emerald-700 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    + Daftar Gmail
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1.5">
              {selectedRole === 'admin'
                ? 'Akses khusus personil IT Administrator untuk meninjau AI dan menangani tiket.'
                : authMode === 'login'
                ? 'Masuk menggunakan email Gmail atau email perusahaan Anda.'
                : 'Daftarkan email Gmail Anda sendiri untuk mulai membuat laporan kendala.'}
            </p>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Notice */}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* FORM 1: LOGIN (User / Admin) */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Alamat Email (Gmail / Kantor)
                  </span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@gmail.com atau nama@perusahaan.co.id"
                  className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-medium text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 mt-2 ${
                  selectedRole === 'admin'
                    ? 'bg-gradient-to-r from-teal-700 to-emerald-800 hover:from-teal-800 hover:to-emerald-900 shadow-teal-700/25'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25'
                }`}
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke {selectedRole === 'admin' ? 'Dashboard Admin' : 'Portal Pengguna'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORM 2: REGISTRASI USER DENGAN GMAIL SENDIRI */}
          {selectedRole === 'user' && authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regNama}
                  onChange={(e) => setRegNama(e.target.value)}
                  placeholder="Contoh: Muhammad Rahman"
                  className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-rose-500" />
                    Alamat Email Gmail <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-semibold border border-rose-200">
                    Bisa Gmail Pribadi
                  </span>
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="nama.anda@gmail.com"
                  className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  Divisi / Posisi Pekerjaan
                </label>
                <input
                  type="text"
                  value={regJabatan}
                  onChange={(e) => setRegJabatan(e.target.value)}
                  placeholder="Contoh: Staf Marketing / Operasional / Keuangan"
                  className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  Buat Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 mt-3"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan User Baru...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Daftarkan Akun & Langsung Masuk</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Credentials Fill (Hanya muncul saat mode Login) */}
          {authMode === 'login' && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <KeyRound className="w-3 h-3" />
                Atau Gunakan Akun Demo Cepat (1-Klik):
              </p>

              {selectedRole === 'user' ? (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('user@perusahaan.co.id');
                      setPassword('user123');
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs text-slate-700 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold block text-slate-800">Ahmad Dahlan (Demo)</span>
                      <span className="text-[11px] text-slate-500">user@perusahaan.co.id</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Pakai</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@perusahaan.co.id');
                    setPassword('admin123');
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-xs text-slate-700 transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold block text-slate-800">Hendra Gunawan (Admin IT)</span>
                    <span className="text-[11px] text-slate-500">admin@perusahaan.co.id</span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">Pakai</span>
                </button>
              )}
            </div>
          )}

        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-5">
          Sistem Helpdesk & Auto-Triage Berbasis AI &bull; Pendaftaran Mandiri dengan Gmail
        </p>

      </div>

    </div>
  );
};
