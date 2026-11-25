'use client';

import React, { useState } from 'react';
import { Ticket, PriorityLevel, TicketStatus, AuthUser } from '@/types';
import { 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2, 
  Clock, 
  HardDrive, 
  MapPin, 
  User, 
  RotateCw, 
  Check, 
  X,
  Search,
  Zap,
  Play,
  CheckSquare,
  PauseCircle,
  FileText,
  Star,
  UserPlus,
  Mail,
  Lock
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: AuthUser;
  tickets: Ticket[];
  onRefreshTickets: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  tickets,
  onRefreshTickets
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterAiOnly, setFilterAiOnly] = useState<'ALL' | 'FAILED_ONLY' | 'SUCCESS_ONLY'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Review & Process Modal State
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [reviewMode, setReviewMode] = useState<'APPROVE' | 'EDIT'>('APPROVE');
  const [targetStatus, setTargetStatus] = useState<TicketStatus>('IN_PROGRESS');
  const [kategoriFinal, setKategoriFinal] = useState<string>('SOFTWARE');
  const [prioritasFinal, setPrioritasFinal] = useState<PriorityLevel>('SEDANG');
  const [catatanAdmin, setCatatanAdmin] = useState<string>('');
  const [solusi, setSolusi] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isReanalyzing, setIsReanalyzing] = useState<boolean>(false);

  // State Tambah User Baru oleh Admin
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserJabatan, setNewUserJabatan] = useState<string>('');
  const [newUserPassword, setNewUserPassword] = useState<string>('user123');
  const [isAddingUser, setIsAddingUser] = useState<boolean>(false);

  // Metrik Statistik
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'OPEN').length;
  const manualClassificationNeeded = tickets.filter(t => t.status === 'OPEN' && t.ai_status === 'FAILED').length;
  const inProgressTickets = tickets.filter(t => ['IN_PROGRESS', 'PENDING'].includes(t.status)).length;
  const resolvedTickets = tickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status)).length;

  // Filter List Tiket
  const filteredTickets = tickets.filter(t => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (filterAiOnly === 'FAILED_ONLY' && t.ai_status !== 'FAILED') return false;
    if (filterAiOnly === 'SUCCESS_ONLY' && t.ai_status !== 'SUCCESS') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        t.id.toLowerCase().includes(q) ||
        t.judul.toLowerCase().includes(q) ||
        t.pengirim.nama.toLowerCase().includes(q) ||
        t.perangkat.toLowerCase().includes(q) ||
        t.lokasi.toLowerCase().includes(q) ||
        (t.ai_analysis?.kategori && t.ai_analysis.kategori.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const openProcessModal = (ticket: Ticket, defaultNextStatus?: TicketStatus) => {
    setSelectedTicket(ticket);
    const initialKategori = ticket.penanganan?.kategori_final || ticket.ai_analysis?.kategori || 'SOFTWARE';
    const initialPrioritas = ticket.penanganan?.prioritas_final || ticket.ai_analysis?.prioritas || 'SEDANG';
    
    setKategoriFinal(initialKategori);
    setPrioritasFinal(initialPrioritas);
    setReviewMode(ticket.ai_status === 'SUCCESS' ? 'APPROVE' : 'EDIT');
    setTargetStatus(defaultNextStatus || (ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status));
    setCatatanAdmin(ticket.penanganan?.catatan_admin || '');
    setSolusi(ticket.penanganan?.solusi || '');
  };

  const handleProcessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    if (targetStatus === 'RESOLVED' && !solusi.trim()) {
      alert('Harap isi laporan solusi perbaikan sebelum menyelesaikan tiket.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin_process',
          status: targetStatus,
          status_review: reviewMode === 'APPROVE' ? 'DISETUJUI' : 'DIKOREKSI',
          kategori_final: kategoriFinal,
          prioritas_final: prioritasFinal,
          catatan_admin: catatanAdmin || (targetStatus === 'IN_PROGRESS' ? 'Sedang ditangani oleh Admin IT.' : 'Diproses Admin.'),
          solusi: targetStatus === 'RESOLVED' ? solusi : undefined,
          diperiksa_oleh: currentUser.nama
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan penanganan');

      await onRefreshTickets();
      setSelectedTicket(null);
    } catch (err: any) {
      alert(`Gagal memproses tiket: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryAi = async () => {
    if (!selectedTicket) return;
    setIsReanalyzing(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force_ai_failure: false })
      });
      const data = await res.json();
      if (res.ok && data.data?.ai_status === 'SUCCESS') {
        setSelectedTicket(data.data);
        setKategoriFinal(data.data.ai_analysis.kategori);
        setPrioritasFinal(data.data.ai_analysis.prioritas);
        setReviewMode('APPROVE');
        await onRefreshTickets();
      } else {
        alert(data.message || 'AI masih belum dapat merespons');
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menghubungi server');
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    setIsAddingUser(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: newUserName,
          email: newUserEmail,
          jabatan: newUserJabatan || 'Karyawan',
          password: newUserPassword || 'user123',
          role: 'user'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menambahkan user');

      alert(`Sukses! User baru "${data.data.nama}" dengan email "${data.data.email}" berhasil ditambahkan.`);
      setIsAddUserModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserJabatan('');
      setNewUserPassword('user123');
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat menambahkan user');
    } finally {
      setIsAddingUser(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Dashboard Admin */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Administrator IT & Verifikasi AI
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tinjau analisa otomatis AI, sesuaikan kategori/prioritas, dan tangani langsung tiket kendala hingga tuntas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            + Tambah User (Gmail)
          </button>

          <button
            onClick={() => onRefreshTickets()}
            className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-sm transition-all"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-500" />
            Segarkan Antrean
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Perlu Ditinjau */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiket Baru (Open)</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{openTickets}</h3>
            <span className="text-[11px] text-blue-600 font-medium">Menunggu penanganan</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: AI Gagal / Perlu Manual */}
        <div 
          onClick={() => setFilterAiOnly(filterAiOnly === 'FAILED_ONLY' ? 'ALL' : 'FAILED_ONLY')}
          className={`cursor-pointer transition-all p-5 rounded-2xl border flex items-center justify-between shadow-sm ${
            manualClassificationNeeded > 0
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20 hover:bg-amber-100/80'
              : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Perlu Klasifikasi Manual</p>
            <h3 className="text-2xl font-black text-amber-900 mt-1">{manualClassificationNeeded}</h3>
            <span className="text-[11px] text-amber-700 font-medium">
              {manualClassificationNeeded > 0 ? 'Klik untuk filter tiket ini' : 'Semua dianalisa AI'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-200/80 text-amber-800 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Sedang Diproses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dalam Proses Penanganan</p>
            <h3 className="text-2xl font-black text-indigo-900 mt-1">{inProgressTickets}</h3>
            <span className="text-[11px] text-indigo-600 font-medium">Ditangani oleh Admin</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <RotateCw className="w-6 h-6 animate-spin" />
          </div>
        </div>

        {/* Card 4: Selesai */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Selesai & Ditutup</p>
            <h3 className="text-2xl font-black text-emerald-900 mt-1">{resolvedTickets}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Resolved & Closed</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID tiket, nama pelapor, judul kendala, perangkat, atau lokasi..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="OPEN">Status: Open (Baru)</option>
            <option value="IN_PROGRESS">Status: Sedang Ditangani</option>
            <option value="PENDING">Status: Ditunda (Pending)</option>
            <option value="RESOLVED">Status: Selesai (Resolved)</option>
            <option value="CLOSED">Status: Ditutup (Closed)</option>
          </select>

          <select
            value={filterAiOnly}
            onChange={(e) => setFilterAiOnly(e.target.value as any)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none"
          >
            <option value="ALL">Semua Status AI</option>
            <option value="FAILED_ONLY">⚠️ AI Gagal / Manual Saja</option>
            <option value="SUCCESS_ONLY">✨ Teranalisa AI Sukses</option>
          </select>
        </div>

      </div>

      {/* TABEL DAFTAR TIKET */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-4 px-4 sm:px-6">ID & Pelapor</th>
                <th className="py-4 px-4">Judul & Detail Keluhan</th>
                <th className="py-4 px-4">Hasil Analisis AI</th>
                <th className="py-4 px-4">Prioritas</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 sm:px-6 text-right">Aksi Penanganan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada tiket yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* ID & Pelapor */}
                    <td className="py-4 px-4 sm:px-6 align-top">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 block w-max mb-1.5">
                        #{ticket.id}
                      </span>
                      <div className="flex items-center gap-2">
                        <img
                          src={ticket.pengirim.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover border border-slate-200"
                        />
                        <span className="font-semibold text-slate-900 text-xs">{ticket.pengirim.nama}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {new Date(ticket.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Judul & Detail */}
                    <td className="py-4 px-4 align-top max-w-xs">
                      <p className="font-bold text-slate-900 leading-snug line-clamp-1">{ticket.judul}</p>
                      <p className="text-slate-500 text-xs line-clamp-2 mt-1">{ticket.pesan}</p>
                      
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                          <HardDrive className="w-3 h-3 text-slate-400" />
                          {ticket.perangkat}
                        </span>
                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {ticket.lokasi}
                        </span>
                      </div>
                    </td>

                    {/* Analisis AI Column */}
                    <td className="py-4 px-4 align-top max-w-xs">
                      {ticket.ai_status === 'SUCCESS' && ticket.ai_analysis ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <Sparkles className="w-3 h-3 text-blue-600" />
                            {ticket.ai_analysis.kategori}
                          </span>
                          <p className="text-[11px] text-slate-600 line-clamp-2 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            &quot;{ticket.ai_analysis.ringkasan}&quot;
                          </p>
                        </div>
                      ) : (
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-tight space-y-1">
                          <div className="flex items-center gap-1 font-bold text-amber-900">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                            Menunggu Klasifikasi Manual
                          </div>
                          <p className="text-amber-700 text-[10px]">
                            Layanan AI offline. Tinjau & tetapkan kategori manual.
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Prioritas */}
                    <td className="py-4 px-4 align-top">
                      {(() => {
                        const prio = ticket.penanganan?.prioritas_final || ticket.ai_analysis?.prioritas || 'SEDANG';
                        const isKritis = prio === 'KRITIS';
                        const isTinggi = prio === 'TINGGI';
                        const isSedang = prio === 'SEDANG';
                        return (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isKritis ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse' :
                            isTinggi ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                            isSedang ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                            'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {isKritis && <Zap className="w-3 h-3" />}
                            {prio}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 align-top">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-1 ${
                        ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' :
                        ticket.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                        ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {ticket.status}
                      </span>

                      {ticket.rating && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          Rating: {ticket.rating.skor}/5
                        </div>
                      )}
                    </td>

                    {/* Aksi Admin */}
                    <td className="py-4 px-4 sm:px-6 align-top text-right">
                      {ticket.status === 'OPEN' ? (
                        <button
                          onClick={() => openProcessModal(ticket, 'IN_PROGRESS')}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Tinjau & Tangani
                        </button>
                      ) : ticket.status === 'IN_PROGRESS' ? (
                        <button
                          onClick={() => openProcessModal(ticket, 'RESOLVED')}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <CheckSquare className="w-4 h-4" />
                          Selesaikan Tiket
                        </button>
                      ) : (
                        <button
                          onClick={() => openProcessModal(ticket)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all ml-auto"
                        >
                          Lihat Detail
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL PROSES PENANGANAN TIKET OLEH ADMIN */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                    #{selectedTicket.id}
                  </span>
                  <span className="text-xs uppercase font-semibold text-indigo-200">
                    Penanganan Tiket oleh Admin IT
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold mt-1 line-clamp-1">
                  {selectedTicket.judul}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleProcessSubmit} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-800">
              
              {/* Kolom Kiri: Laporan & AI Suggestion */}
              <div className="space-y-4 pr-0 md:pr-4 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Informasi Keluhan Pelapor:
                </h4>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nama Pelapor:</span>
                    <span className="font-bold text-slate-800">{selectedTicket.pengirim.nama} ({selectedTicket.pengirim.email})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Perangkat:</span>
                      <span className="font-semibold text-slate-800">{selectedTicket.perangkat}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Lokasi:</span>
                      <span className="font-semibold text-slate-800">{selectedTicket.lokasi}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-600 block mb-1">Rincian Kendala:</span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {selectedTicket.pesan}
                  </div>
                </div>

                {/* Rekomendasi Tindakan AI */}
                {selectedTicket.ai_analysis && (
                  <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-1.5">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Rekomendasi Langkah Penanganan AI:
                    </span>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                      {selectedTicket.ai_analysis.saran_tindakan}
                    </p>
                  </div>
                )}
              </div>

              {/* Kolom Kanan: Aksi & Pembaruan Status Admin */}
              <div className="space-y-4">
                
                {/* AI Status Badge & Toggle Approve/Edit */}
                {selectedTicket.ai_status === 'SUCCESS' && selectedTicket.ai_analysis ? (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        AI Auto-Classification Aktif
                      </span>
                      <p className="text-[11px] text-indigo-700 mt-0.5">
                        Saran AI: <strong>{selectedTicket.ai_analysis.kategori}</strong> &bull; Prioritas: <strong>{selectedTicket.ai_analysis.prioritas}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-indigo-200">
                      <button
                        type="button"
                        onClick={() => {
                          setReviewMode('APPROVE');
                          setKategoriFinal(selectedTicket.ai_analysis!.kategori);
                          setPrioritasFinal(selectedTicket.ai_analysis!.prioritas);
                        }}
                        className={`px-2 py-1 text-xs font-semibold rounded-lg ${
                          reviewMode === 'APPROVE' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Setujui AI
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewMode('EDIT')}
                        className={`px-2 py-1 text-xs font-semibold rounded-lg ${
                          reviewMode === 'EDIT' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Koreksi
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        AI Gagal - Menunggu Klasifikasi Manual
                      </div>
                      <button
                        type="button"
                        onClick={handleRetryAi}
                        disabled={isReanalyzing}
                        className="text-xs px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                      >
                        <RotateCw className={`w-3 h-3 ${isReanalyzing ? 'animate-spin' : ''}`} />
                        Coba Analisa AI Ulang
                      </button>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Tentukan Kategori & Prioritas yang tepat di bawah ini.
                    </p>
                  </div>
                )}

                {/* Form Input Kategori & Prioritas */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Kategori Tiket:
                    </label>
                    <select
                      value={kategoriFinal}
                      onChange={(e) => setKategoriFinal(e.target.value)}
                      className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold bg-white"
                    >
                      <option value="JARINGAN">JARINGAN (Network/WiFi)</option>
                      <option value="HARDWARE">HARDWARE (Laptop/PC/Printer)</option>
                      <option value="SOFTWARE">SOFTWARE (Aplikasi/OS)</option>
                      <option value="AKUN_AKSES">AKUN_AKSES (Login/Password)</option>
                      <option value="FASILITAS_LISTRIK">FASILITAS_LISTRIK (AC/Daya)</option>
                      <option value="LAINNYA">LAINNYA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Prioritas Tiket:
                    </label>
                    <select
                      value={prioritasFinal}
                      onChange={(e) => setPrioritasFinal(e.target.value as PriorityLevel)}
                      className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold bg-white"
                    >
                      <option value="KRITIS">KRITIS</option>
                      <option value="TINGGI">TINGGI</option>
                      <option value="SEDANG">SEDANG</option>
                      <option value="RENDAH">RENDAH</option>
                    </select>
                  </div>
                </div>

                {/* Pilih Target Status Penanganan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tindakan Status Admin:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetStatus('IN_PROGRESS')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                        targetStatus === 'IN_PROGRESS'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Sedang Diproses</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetStatus('PENDING')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                        targetStatus === 'PENDING'
                          ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <PauseCircle className="w-3.5 h-3.5" />
                      <span>Ditunda (Pending)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetStatus('RESOLVED')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                        targetStatus === 'RESOLVED'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Selesai (Resolved)</span>
                    </button>
                  </div>
                </div>

                {/* Input Catatan Admin */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Catatan Penanganan Admin:
                  </label>
                  <input
                    type="text"
                    value={catatanAdmin}
                    onChange={(e) => setCatatanAdmin(e.target.value)}
                    placeholder="Contoh: Sedang dilakukan pengecekan konfigurasi router..."
                    className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Input Solusi (Wajib jika status RESOLVED) */}
                {targetStatus === 'RESOLVED' && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-1.5 animate-in fade-in">
                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Laporan Solusi / Tindakan Perbaikan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={solusi}
                      onChange={(e) => setSolusi(e.target.value)}
                      placeholder="Jelaskan penyebab masalah dan solusi teknis yang telah diterapkan agar pengguna mengetahui bahwa kendala telah tuntas..."
                      className="w-full text-xs sm:text-sm p-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    />
                    <p className="text-[11px] text-emerald-700">
                      Solusi ini akan tampil pada portal pelapor dan mereka akan diminta memberikan rating bintang 1–5.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/25 rounded-xl transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Simpan Perubahan Penanganan</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL TAMBAH USER BARU OLEH ADMIN */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-700 to-purple-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-200" />
                <div>
                  <h3 className="text-base font-bold">Tambah Pengguna Baru</h3>
                  <p className="text-xs text-indigo-200">Daftarkan email Gmail untuk karyawan/user</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4 text-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  Nama Lengkap User <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Contoh: Rahmat Hidayat"
                  className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
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
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="rahmat.hidayat@gmail.com"
                  className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Divisi / Jabatan
                </label>
                <input
                  type="text"
                  value={newUserJabatan}
                  onChange={(e) => setNewUserJabatan(e.target.value)}
                  placeholder="Contoh: Staf Logistik / Finance"
                  className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Password Sementara <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="user123"
                  className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  disabled={isAddingUser}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isAddingUser}
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
                >
                  {isAddingUser ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan User Baru</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
