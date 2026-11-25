'use client';

import React, { useState } from 'react';
import { Ticket } from '@/types';
import { Star, X, CheckCircle2, MessageSquare, ShieldCheck } from 'lucide-react';

interface RatingModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitRating: (ticketId: string, skor: number, ulasan: string) => Promise<void>;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onSubmitRating
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ulasan, setUlasan] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmitRating(ticket.id, rating, ulasan);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">Tiket Telah Selesai</span>
          </div>
          <h3 className="text-lg font-bold leading-snug">Berikan Penilaian Solusi Admin</h3>
          <p className="text-xs text-blue-100 mt-1">
            Bagaimana kepuasan Anda terhadap penanganan kendala tiket #{ticket.id}?
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-800">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Judul Masalah:</p>
            <p className="text-sm font-semibold text-slate-900 line-clamp-1">{ticket.judul}</p>
            {ticket.penanganan?.diperiksa_oleh && (
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Ditangani oleh: <span className="font-semibold text-indigo-700">{ticket.penanganan.diperiksa_oleh}</span>
              </p>
            )}
          </div>

          {/* Solusi dari Admin */}
          {ticket.penanganan?.solusi && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
              <span className="font-semibold block mb-0.5">Solusi dari Admin IT:</span>
              {ticket.penanganan.solusi}
            </div>
          )}

          {/* Star Rating Selector */}
          <div className="text-center py-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Tingkat Kepuasan Anda
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-medium text-slate-500 mt-2">
              {rating === 5 && '⭐ Sangat Puas - Respon cepat dan tuntas!'}
              {rating === 4 && '👍 Puas - Penanganan kendala memuaskan.'}
              {rating === 3 && '👌 Cukup - Masalah sudah terselesaikan.'}
              {rating === 2 && '👎 Kurang Puas - Respon penanganan lambat.'}
              {rating === 1 && '⚠️ Kecewa - Penanganan belum memuaskan.'}
            </p>
          </div>

          {/* Ulasan Feedback Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              Ulasan / Masukan Anda (Opsional)
            </label>
            <textarea
              rows={3}
              value={ulasan}
              onChange={(e) => setUlasan(e.target.value)}
              placeholder="Berikan feedback Anda mengenai penanganan masalah ini..."
              className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Nanti Saja
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              {submitting ? 'Mengirim...' : 'Kirim Penilaian & Tutup Tiket'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
