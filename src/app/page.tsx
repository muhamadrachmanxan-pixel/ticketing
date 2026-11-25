'use client';

import React, { useState, useEffect } from 'react';
import { AuthUser, Ticket } from '@/types';
import { Navbar } from '@/components/Navbar';
import { CustomerPortal } from '@/components/CustomerPortal';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AuthScreen } from '@/components/AuthScreen';
import { AiSettingsModal } from '@/components/AiSettingsModal';
import { RotateCw } from 'lucide-react';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState<boolean>(false);

  // Muat sesi login dari localStorage jika ada
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('smartticket_auth');
      if (savedAuth) {
        setCurrentUser(JSON.parse(savedAuth));
      }
    } catch (e) {
      console.warn('Gagal memuat sesi auth lokal');
    }
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      if (data.success) {
        setTickets(data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil tiket:', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchTickets();
      setLoading(false);
    };
    initData();
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('smartticket_auth', JSON.stringify(user));
    } catch (e) {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('smartticket_auth');
    } catch (e) {}
  };

  const handleRatingSubmit = async (ticketId: string, skor: number, ulasan: string) => {
    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'customer_rating',
        skor,
        ulasan,
        aktor: currentUser?.nama || 'Pengguna'
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal menyimpan ulasan');
    await fetchTickets();
  };

  // Jika belum login, tampilkan layar login terpisah
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSettings={() => setIsAiSettingsOpen(true)}
      />

      {/* Main Viewport */}
      <main className="flex-1 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <RotateCw className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Memuat data tiket...</p>
          </div>
        ) : (
          <>
            {currentUser.role === 'user' ? (
              <CustomerPortal
                currentUser={currentUser}
                tickets={tickets}
                onRefreshTickets={fetchTickets}
                onSubmitRating={handleRatingSubmit}
              />
            ) : (
              <AdminDashboard
                currentUser={currentUser}
                tickets={tickets}
                onRefreshTickets={fetchTickets}
              />
            )}
          </>
        )}
      </main>

      {/* AI Settings Modal */}
      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
      />

      {/* Modern Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span>Ticketing Trans Hamana</span>
            <span>&bull;</span>
            <span className="text-emerald-600 font-semibold">User & Admin IT Portal</span>
          </div>
          <p className="text-slate-400">
            Login terpisah untuk Pengguna dan Administrator IT &bull; Didukung AI Auto-Triage & Fallback Cerdas
          </p>
        </div>
      </footer>

    </div>
  );
}
