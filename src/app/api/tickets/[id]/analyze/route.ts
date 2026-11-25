import { NextResponse } from 'next/server';
import { getTicketById, updateTicket, addActivityLog } from '@/lib/db';
import { analyzeTicketWithAI } from '@/lib/ai-service';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;
    const ticket = getTicketById(ticketId);

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'Tiket tidak ditemukan' },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const force_ai_failure = Boolean(body?.force_ai_failure);

    try {
      const aiResult = await analyzeTicketWithAI({
        judul: ticket.judul,
        pesan: ticket.pesan,
        perangkat: ticket.perangkat,
        lokasi: ticket.lokasi
      }, force_ai_failure);

      const updated = updateTicket(ticketId, {
        ai_status: 'SUCCESS',
        ai_error: undefined,
        ai_analysis: aiResult
      });

      addActivityLog(ticketId, {
        aktor: 'AI Engine',
        role: 'system',
        aksi: 'Analisis AI Ulang Berhasil',
        keterangan: `Kategori: ${aiResult.kategori} | Prioritas: ${aiResult.prioritas}`
      });

      return NextResponse.json({
        success: true,
        message: 'Analisis AI berhasil diperbarui',
        data: updated
      });
    } catch (aiErr: any) {
      const updated = updateTicket(ticketId, {
        ai_status: 'FAILED',
        ai_error: aiErr.message || 'Layanan AI gagal menganalisis'
      });

      addActivityLog(ticketId, {
        aktor: 'AI Engine',
        role: 'system',
        aksi: 'Analisis AI Ulang Gagal',
        keterangan: aiErr.message || 'Layanan AI tidak merespons'
      });

      return NextResponse.json({
        success: false,
        message: 'Analisis AI gagal. ' + (aiErr.message || ''),
        data: updated
      }, { status: 422 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
