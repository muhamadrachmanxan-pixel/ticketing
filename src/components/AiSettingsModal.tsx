'use client';

import React, { useState } from 'react';
import { Ticket, Key, Sparkles, Check, AlertCircle, RefreshCw, X, ShieldAlert } from 'lucide-react';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiSettingsModal: React.FC<AiSettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<string>('gemini-1.5-flash');
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'failed', message?: string }>({ status: 'idle' });

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult({ status: 'idle' });
    try {
      // Panggil endpoint tes
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: 'Tes Koneksi Sistem AI Helpdesk',
          pesan: 'Uji respon otomatis AI untuk menentukan kategori dan prioritas tiket.',
          perangkat: 'Server Testing',
          lokasi: 'Data Center Lt 1',
          force_ai_failure: false
        })
      });
      const data = await res.json();
      if (res.ok && data.data?.ai_status === 'SUCCESS') {
        setTestResult({
          status: 'success',
          message: `Koneksi AI aktif & responsif! Model: ${data.data?.ai_analysis?.model_used}`
        });
      } else {
        setTestResult({
          status: 'failed',
          message: data.message || 'Layanan AI mengembalikan status error'
        });
      }
    } catch (err: any) {
      setTestResult({ status: 'failed', message: err.message || 'Gagal menghubungi server' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Ticket className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">Konfigurasi Layanan AI</h3>
              <p className="text-xs text-blue-200">Pengaturan Google Gemini & Intelligent Fallback</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-800">
          
          <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-blue-800 mb-1">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Sistem Triage Cerdas Siap Pakai
            </div>
            Sistem dilengkapi dengan <strong>Intelligent Fallback Engine</strong>. Aplikasi dapat berjalan langsung secara optimal baik dengan Google Gemini API maupun offline engine bawaan!
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Pilihan Model AI
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white font-medium"
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Sangat Cepat & Efisien - Rekomendasi)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Next-Gen Ultra Cepat)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Penalaran Rumit & Analisis Mendalam)</option>
              <option value="builtin-heuristic">Built-in Intelligent Heuristic (Offline / Zero Token)</option>
            </select>
          </div>

          {/* Parameter AI yang dianalisis */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
            <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <span>Output Parameter AI:</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span><strong>Kategori:</strong> Network, HW, App, dll.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span><strong>Prioritas:</strong> Kritis, Tinggi, Sedang, Rendah</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span><strong>Dampak:</strong> Estimasi keparahan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span><strong>Saran Tindakan:</strong> Action plan teknisi</span>
              </div>
            </div>
          </div>

          {/* Fallback Behavior Indicator */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold block">Fitur Fault-Tolerance Alur Tiket:</span>
              Jika API layanan AI mengalami gangguan / timeout, tiket pengguna tetap masuk 100% dengan status <em>&quot;Menunggu klasifikasi manual&quot;</em> agar tidak ada komplain yang terlewat.
            </div>
          </div>

          {/* Test AI Result */}
          {testResult.status === 'success' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{testResult.message}</span>
            </div>
          )}
          {testResult.status === 'failed' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Menguji Respon...' : 'Uji Diagnosa AI'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
            >
              Tutup & Simpan
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
