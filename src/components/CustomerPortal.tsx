'use client';

import React, { useState } from 'react';
import { Ticket, AuthUser } from '@/types';
import { 
  PlusCircle, 
  ListFilter, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  HardDrive, 
  MapPin, 
  Paperclip, 
  FileText, 
  Send, 
  Star, 
  RotateCw,
  HelpCircle,
  Eye,
  X,
  Upload,
  User,
  ShieldCheck
} from 'lucide-react';
import { RatingModal } from './RatingModal';

interface CustomerPortalProps {
  currentUser: AuthUser;
  tickets: Ticket[];
  onRefreshTickets: () => Promise<void>;
  onSubmitRating: (ticketId: string, skor: number, ulasan: string) => Promise<void>;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  currentUser,
  tickets,
  onRefreshTickets,
  onSubmitRating
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  
  // Form State
  const [judul, setJudul] = useState('');
  const [pesan, setPesan] = useState('');
  const [perangkat, setPerangkat] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [lampiranList, setLampiranList] = useState<{ id: string; nama: string; url: string; tipe: string; ukuran?: string }[]>([]);
  const [forceAiFailure, setForceAiFailure] = useState(false);
  
  // Submission & AI progress state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState<string>('');
  const [submissionSuccessData, setSubmissionSuccessData] = useState<Ticket | null>(null);

  // Detail Modal & Rating Modal
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ratingTargetTicket, setRatingTargetTicket] = useState<Ticket | null>(null);

  // Quick suggestions
  const quickDevices = ['Laptop Lenovo ThinkPad', 'Printer Epson L3110', 'PC Desktop Kantor', 'WiFi Access Point', 'Akun Email & ERP'];
  const quickLocations = ['Gedung A, Lantai 1', 'Gedung A, Lantai 2', 'Gedung B, Divisi Keuangan', 'Ruang Server Lt 3', 'Cabang Bandung'];

  // Filter tiket milik pengguna saat ini
  const myTickets = tickets.filter(t => t.pengirim.email === currentUser.email || t.pengirim.id === currentUser.id);

  const handleSimulateAttachment = (fileName: string) => {
    setLampiranList(prev => [
      ...prev,
      {
        id: `ATT-${Date.now()}`,
        nama: fileName,
        url: '#',
        tipe: fileName.endsWith('.png') || fileName.endsWith('.jpg') ? 'image/png' : 'application/pdf',
        ukuran: '1.2 MB'
      }
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !pesan.trim()) return;

    setIsSubmitting(true);
    setSubmissionStep('1/3: Menyimpan tiket ke database...');

    try {
      await new Promise(r => setTimeout(r, 500));
      setSubmissionStep('2/3: Menghubungi AI Service untuk triage otomatis...');

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul,
          pesan,
          perangkat,
          lokasi,
          lampiran: lampiranList,
          pengirim: {
            id: currentUser.id,
            nama: currentUser.nama,
            email: currentUser.email,
            avatar: currentUser.avatar
          },
          force_ai_failure: forceAiFailure
        })
      });

      setSubmissionStep('3/3: Menerima parameter AI & finalisasi...');
      await new Promise(r => setTimeout(r, 500));

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan tiket');

      setSubmissionSuccessData(data.data);
      await onRefreshTickets();

      // Reset form
      setJudul('');
      setPesan('');
      setPerangkat('');
      setLokasi('');
      setLampiranList([]);
      setForceAiFailure(false);
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      setSubmissionStep('');
    }
  };

  const getStatusBadge = (ticket: Ticket) => {
    switch (ticket.status) {
      case 'OPEN':
        if (ticket.ai_status === 'FAILED') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5" /> Menunggu Klasifikasi Manual
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> Tiket Baru (Open)
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <RotateCw className="w-3.5 h-3.5 animate-spin" /> Sedang Ditangani Admin
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
            <Clock className="w-3.5 h-3.5" /> Menunggu Suku Cadang / Vendor
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai (Beri Rating)
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" /> Ditutup ({ticket.rating?.skor}★)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            {ticket.status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner Selamat Datang Pengguna */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            Portal Layanan Pengguna & Auto-Triage AI
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {currentUser.nama}! 👋
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Laporkan kendala perangkat atau kebutuhan IT Anda. Sistem AI kami akan menganalisis prioritas secara otomatis dan Admin IT akan segera menanganinya.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'create'
                  ? 'bg-white text-emerald-950 shadow-md font-bold'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Buat Tiket Baru
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'list'
                  ? 'bg-white text-emerald-950 shadow-md font-bold'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              Tiket Saya ({myTickets.length})
            </button>
          </div>
        </div>
      </div>

      {/* Pop-up Notifikasi Sukses */}
      {submissionSuccessData && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-lg flex items-start justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base">Tiket Berhasil Masuk!</span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                  #{submissionSuccessData.id}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {submissionSuccessData.ai_status === 'SUCCESS' ? (
                  <>
                    <strong className="text-emerald-700">Analisis AI:</strong> Kategori{' '}
                    <strong>{submissionSuccessData.ai_analysis?.kategori}</strong> &bull; Prioritas{' '}
                    <strong>{submissionSuccessData.ai_analysis?.prioritas}</strong>.
                    <br />
                    <em>&quot;{submissionSuccessData.ai_analysis?.ringkasan}&quot;</em>
                  </>
                ) : (
                  <>
                    <strong className="text-amber-700">Perhatian:</strong> Layanan AI sedang offline. Tiket tetap tersimpan dengan status <strong>Menunggu Klasifikasi Manual</strong> oleh Admin IT.
                  </>
                )}
              </p>
              <div className="mt-3">
                <button
                  onClick={() => {
                    setSelectedTicket(submissionSuccessData);
                    setSubmissionSuccessData(null);
                  }}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 underline"
                >
                  Lihat Detail & Tracking Tiket &rarr;
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSubmissionSuccessData(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* TAB 1: FORM BUAT TIKET */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Formulir Laporan Kendala</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Pesan keluhan Anda akan dianalisis secara otomatis oleh sistem AI untuk menentukan tingkat prioritas penanganan.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5" />
              AI Auto-Triage Active
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Judul Keluhan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Judul Masalah / Kendala <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Contoh: WiFi di Lantai 2 terputus dan tidak dapat membuka ERP"
                className="w-full text-sm sm:text-base p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>

            {/* Grid: Perangkat & Lokasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Perangkat */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                  Perangkat Terkait <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={perangkat}
                  onChange={(e) => setPerangkat(e.target.value)}
                  placeholder="Contoh: Laptop ThinkPad T14 / Printer Epson"
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {quickDevices.map((d, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setPerangkat(d)}
                      className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg transition-colors border border-slate-200"
                    >
                      + {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lokasi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  Lokasi / Ruangan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  placeholder="Contoh: Gedung A Lantai 2, Divisi Keuangan"
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {quickLocations.map((l, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setLokasi(l)}
                      className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-lg transition-colors border border-slate-200"
                    >
                      + {l}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Pesan / Deskripsi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Pesan / Rincian Gejala <span className="text-red-500">*</span></span>
                <span className="text-[11px] font-normal text-slate-400">Jelaskan kendala secara rinci</span>
              </label>
              <textarea
                rows={4}
                required
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                placeholder="Jelaskan apa yang terjadi, sejak kapan masalah muncul, dan dampaknya pada pekerjaan Anda..."
                className="w-full text-sm p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Lampiran Pendukung */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                Lampiran Pendukung (Foto / Tangkapan Layar)
              </label>
              
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => handleSimulateAttachment('foto_tangkapan_layar_error.png')}
                  className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3 h-3 text-slate-600" />
                  + Foto Screenshot Error (Simulasi)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateAttachment('log_kendala.txt')}
                  className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3 h-3 text-slate-600" />
                  + File Log (.txt)
                </button>
              </div>

              {lampiranList.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {lampiranList.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                      <Paperclip className="w-3 h-3 text-emerald-600" />
                      <span>{att.nama}</span>
                      <button
                        type="button"
                        onClick={() => setLampiranList(prev => prev.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-500 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Switch Uji Skenario AI Error */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Uji Skenario: AI Mengalami Gangguan / Offline</h4>
                  <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                    Jika sakelar ini diaktifkan, AI disimulasikan gagal merespons. Tiket Anda akan tetap tersimpan aman di database dengan status <strong>Menunggu Klasifikasi Manual</strong> oleh Admin IT.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={forceAiFailure}
                  onChange={(e) => setForceAiFailure(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {/* Tombol Kirim */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>{submissionStep || 'Memproses Analisa AI...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Tiket & Analisis AI</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* TAB 2: DAFTAR TIKET SAYA */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Tiket Laporan Saya</h2>
            <button
              onClick={() => onRefreshTickets()}
              className="text-xs font-semibold text-slate-600 hover:text-emerald-600 flex items-center gap-1.5 p-2 rounded-lg hover:bg-slate-100"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Segarkan Data
            </button>
          </div>

          {myTickets.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Belum Ada Tiket yang Dibuat</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Anda belum memiliki riwayat kendala. Klik tab &quot;Buat Tiket Baru&quot; untuk mengajukan bantuan teknis.
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 shadow-md shadow-emerald-500/20"
              >
                Buat Tiket Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        #{ticket.id}
                      </span>
                      {getStatusBadge(ticket)}
                      {ticket.ai_analysis && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {ticket.ai_analysis.kategori}
                        </span>
                      )}
                      {ticket.penanganan?.prioritas_final && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          ticket.penanganan.prioritas_final === 'KRITIS' ? 'bg-red-100 text-red-800' :
                          ticket.penanganan.prioritas_final === 'TINGGI' ? 'bg-orange-100 text-orange-800' :
                          ticket.penanganan.prioritas_final === 'SEDANG' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          Prioritas {ticket.penanganan.prioritas_final}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {ticket.judul}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                        {ticket.perangkat}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {ticket.lokasi}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(ticket.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {ticket.penanganan?.solusi && (
                      <div className="text-xs text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                        <span className="font-bold block mb-0.5">Solusi dari Admin:</span>
                        {ticket.penanganan.solusi}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    
                    {/* Tombol Beri Rating Saat Status RESOLVED */}
                    {ticket.status === 'RESOLVED' && (
                      <button
                        onClick={() => setRatingTargetTicket(ticket)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-1.5"
                      >
                        <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                        Beri Penilaian Solusi
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detail & Tracking
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAIL MODAL DENGAN TRACKER */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-700 to-teal-700 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                  #{selectedTicket.id}
                </span>
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

            <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
              
              {/* STEP TRACKER (User -> AI -> Admin -> Selesai) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                  Perjalanan Status Tiket:
                </p>
                
                <div className="flex items-center justify-between text-xs font-semibold text-center relative">
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs mb-1">
                      1
                    </div>
                    <span className="text-emerald-700">Dibuat</span>
                  </div>

                  <div className={`h-0.5 flex-1 ${selectedTicket.ai_status === 'SUCCESS' ? 'bg-emerald-600' : 'bg-slate-300'}`} />

                  <div className="flex-1 flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs mb-1 ${
                      selectedTicket.ai_status === 'SUCCESS' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      2
                    </div>
                    <span className={selectedTicket.ai_status === 'SUCCESS' ? 'text-emerald-700' : 'text-amber-700'}>
                      {selectedTicket.ai_status === 'SUCCESS' ? 'Analisis AI' : 'Manual'}
                    </span>
                  </div>

                  <div className={`h-0.5 flex-1 ${['IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'].includes(selectedTicket.status) ? 'bg-emerald-600' : 'bg-slate-300'}`} />

                  <div className="flex-1 flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs mb-1 ${
                      ['IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'].includes(selectedTicket.status) ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
                    }`}>
                      3
                    </div>
                    <span className={['IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'].includes(selectedTicket.status) ? 'text-emerald-700' : 'text-slate-400'}>
                      Diproses Admin
                    </span>
                  </div>

                  <div className={`h-0.5 flex-1 ${['RESOLVED', 'CLOSED'].includes(selectedTicket.status) ? 'bg-teal-600' : 'bg-slate-300'}`} />

                  <div className="flex-1 flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs mb-1 ${
                      ['RESOLVED', 'CLOSED'].includes(selectedTicket.status) ? 'bg-teal-600 text-white' : 'bg-slate-300 text-slate-600'
                    }`}>
                      4
                    </div>
                    <span className={['RESOLVED', 'CLOSED'].includes(selectedTicket.status) ? 'text-teal-700 font-bold' : 'text-slate-400'}>
                      Selesai
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Laporan */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Perangkat:</span>
                    <span className="font-semibold text-slate-800">{selectedTicket.perangkat}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Lokasi:</span>
                    <span className="font-semibold text-slate-800">{selectedTicket.lokasi}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block mb-1">Isi Pesan Keluhan:</span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 whitespace-pre-line">
                    {selectedTicket.pesan}
                  </div>
                </div>
              </div>

              {/* Hasil Analisis AI */}
              {selectedTicket.ai_analysis && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Hasil Ekstraksi Parameter AI:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-emerald-700 font-medium">Kategori:</span>{' '}
                      <span className="font-bold text-slate-800">{selectedTicket.ai_analysis.kategori}</span>
                    </div>
                    <div>
                      <span className="text-emerald-700 font-medium">Prioritas:</span>{' '}
                      <span className="font-bold text-slate-800">{selectedTicket.ai_analysis.prioritas}</span>
                    </div>
                  </div>
                  <div className="text-slate-700 pt-1 border-t border-emerald-200/60">
                    <span className="font-medium text-emerald-900 block">Ringkasan Masalah:</span>
                    {selectedTicket.ai_analysis.ringkasan}
                  </div>
                </div>
              )}

              {/* Penanganan & Solusi dari Admin */}
              {selectedTicket.penanganan && (
                <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-teal-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Penanganan oleh Admin IT:
                  </span>
                  <p className="text-slate-700">
                    Admin: <strong>{selectedTicket.penanganan.diperiksa_oleh || 'Admin IT'}</strong>
                  </p>
                  {selectedTicket.penanganan.catatan_admin && (
                    <p className="text-slate-600">Catatan: {selectedTicket.penanganan.catatan_admin}</p>
                  )}
                  {selectedTicket.penanganan.solusi && (
                    <div className="mt-2 pt-2 border-t border-teal-200/80 bg-white p-3 rounded-xl border">
                      <span className="font-bold text-emerald-800 block mb-0.5">Laporan Solusi:</span>
                      <p className="text-slate-800">{selectedTicket.penanganan.solusi}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Rating yang sudah diberikan */}
              {selectedTicket.rating && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center gap-1 text-amber-700 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    Penilaian Anda: {selectedTicket.rating.skor}/5 Bintang
                  </div>
                  <p className="text-slate-700 italic">&quot;{selectedTicket.rating.ulasan}&quot;</p>
                </div>
              )}

              {/* Riwayat Aktivitas Log */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Riwayat Aktivitas Tiket:
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedTicket.riwayat_aktivitas.map((act) => (
                    <div key={act.id} className="text-xs border-l-2 border-emerald-500 pl-3 py-1 bg-slate-50 rounded-r-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{act.aksi}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(act.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">{act.keterangan}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {selectedTicket.status === 'RESOLVED' ? (
                <button
                  onClick={() => {
                    const t = selectedTicket;
                    setSelectedTicket(null);
                    setRatingTargetTicket(t);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                  Beri Penilaian Sekarang
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* RATING MODAL */}
      <RatingModal
        ticket={ratingTargetTicket}
        isOpen={Boolean(ratingTargetTicket)}
        onClose={() => setRatingTargetTicket(null)}
        onSubmitRating={onSubmitRating}
      />

    </div>
  );
};
