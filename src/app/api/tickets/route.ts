import { NextResponse } from 'next/server';
import { getTickets, createTicket, generateTicketId, addActivityLog } from '@/lib/db';
import { analyzeTicketWithAI } from '@/lib/ai-service';
import { Ticket, AIStatus } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let tickets = getTickets();

    if (role === 'user' && userId) {
      tickets = tickets.filter(t => t.pengirim.id === userId || t.pengirim.email === userId);
    }

    if (status && status !== 'ALL') {
      tickets = tickets.filter(t => t.status === status);
    }

    return NextResponse.json({ success: true, data: tickets });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memuat tiket' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { judul, pesan, perangkat, lokasi, lampiran, pengirim, force_ai_failure } = body;

    if (!judul || !pesan) {
      return NextResponse.json(
        { success: false, message: 'Judul dan pesan tiket wajib diisi' },
        { status: 400 }
      );
    }

    const ticketId = generateTicketId();
    const now = new Date().toISOString();

    // 1. Inisialisasi status AI
    let aiStatus: AIStatus = 'PENDING';
    let aiAnalysisResult = undefined;
    let aiErrorMessage = undefined;

    // 2. Hubungi AI Service
    try {
      aiAnalysisResult = await analyzeTicketWithAI(
        { judul, pesan, perangkat, lokasi },
        Boolean(force_ai_failure)
      );
      aiStatus = 'SUCCESS';
    } catch (aiErr: any) {
      console.warn(`[AI Warning] Analisis AI gagal untuk tiket ${ticketId}:`, aiErr.message);
      aiStatus = 'FAILED';
      aiErrorMessage = aiErr.message || 'Layanan AI tidak dapat merespons atau sedang offline.';
    }

    // 3. Simpan tiket (selalu disimpan baik AI berhasil maupun gagal)
    const newTicket: Ticket = {
      id: ticketId,
      judul,
      pesan,
      perangkat: perangkat || 'Tidak disebutkan',
      lokasi: lokasi || 'Tidak disebutkan',
      lampiran: lampiran || [],
      pengirim: pengirim || {
        id: 'USR-01',
        nama: 'Ahmad Dahlan',
        email: 'ahmad.dahlan@perusahaan.co.id',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
      },
      status: 'OPEN',
      ai_status: aiStatus,
      ai_error: aiErrorMessage,
      ai_analysis: aiAnalysisResult,
      riwayat_aktivitas: [
        {
          id: `ACT-${Date.now()}-1`,
          waktu: now,
          aktor: pengirim?.nama || 'Pengguna',
          role: 'user',
          aksi: 'Tiket Dibuat',
          keterangan: 'Tiket baru berhasil disimpan ke sistem dengan status Open'
        },
        {
          id: `ACT-${Date.now()}-2`,
          waktu: now,
          aktor: 'AI Assistant',
          role: 'system',
          aksi: aiStatus === 'SUCCESS' ? 'Analisis AI Berhasil' : 'Analisis AI Gagal (Menunggu Verifikasi Manual)',
          keterangan: aiStatus === 'SUCCESS'
            ? `AI mengidentifikasi: ${aiAnalysisResult?.kategori} | Prioritas: ${aiAnalysisResult?.prioritas}`
            : `AI gagal menganalisis (${aiErrorMessage}). Tiket dialihkan ke antrean klasifikasi manual operator.`
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    createTicket(newTicket);

    return NextResponse.json({
      success: true,
      message: aiStatus === 'SUCCESS' 
        ? 'Tiket berhasil dibuat dan telah dianalisis oleh AI' 
        : 'Tiket berhasil dibuat. Layanan AI sedang offline sehingga tiket menunggu klasifikasi manual oleh operator.',
      data: newTicket
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}
