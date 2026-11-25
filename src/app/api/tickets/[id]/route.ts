import { NextResponse } from 'next/server';
import { getTicketById, updateTicket, addActivityLog } from '@/lib/db';
import { TicketStatus, PriorityLevel } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ticket = getTicketById(params.id);
    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'Tiket tidak ditemukan' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: ticket });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mengambil detail tiket' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const body = await request.json();
    const { action } = body;
    const now = new Date().toISOString();

    // 1. Aksi Admin: Tinjau AI, Ubah Status Penanganan (IN_PROGRESS, PENDING, RESOLVED), & Input Solusi
    if (action === 'admin_process') {
      const {
        status, // 'IN_PROGRESS' | 'PENDING' | 'RESOLVED'
        status_review = 'DISETUJUI',
        kategori_final,
        prioritas_final,
        catatan_admin,
        solusi,
        diperiksa_oleh = 'Admin IT'
      } = body;

      const currentPenanganan = ticket.penanganan || {};

      const updatedPenanganan = {
        ...currentPenanganan,
        status_review,
        kategori_final: kategori_final || ticket.ai_analysis?.kategori || 'SOFTWARE',
        prioritas_final: (prioritas_final as PriorityLevel) || ticket.ai_analysis?.prioritas || 'SEDANG',
        catatan_admin: catatan_admin || currentPenanganan.catatan_admin || 'Diproses oleh Administrator IT',
        diperiksa_oleh,
        mulai_pada: status === 'IN_PROGRESS' && !currentPenanganan.mulai_pada ? now : currentPenanganan.mulai_pada,
        selesai_pada: status === 'RESOLVED' ? now : currentPenanganan.selesai_pada,
        solusi: status === 'RESOLVED' ? (solusi || 'Kendala telah diselesaikan oleh Admin IT.') : currentPenanganan.solusi
      };

      const targetStatus: TicketStatus = status as TicketStatus;

      const updated = updateTicket(ticketId, {
        status: targetStatus,
        penanganan: updatedPenanganan
      });

      let logAksi = 'Pembaruan oleh Admin';
      if (targetStatus === 'IN_PROGRESS') logAksi = 'Tiket Diproses Admin';
      if (targetStatus === 'PENDING') logAksi = 'Tiket Ditunda (Menunggu Part/Vendor)';
      if (targetStatus === 'RESOLVED') logAksi = 'Tiket Selesai (Resolved)';

      addActivityLog(ticketId, {
        aktor: diperiksa_oleh,
        role: 'admin',
        aksi: logAksi,
        keterangan: targetStatus === 'RESOLVED'
          ? `Admin menyelesaikan tiket. Solusi: ${solusi || '-'}`
          : `Admin mengubah status menjadi ${targetStatus}. Catatan: ${catatan_admin || '-'}`
      });

      return NextResponse.json({
        success: true,
        message: `Tiket berhasil diperbarui menjadi status ${targetStatus}`,
        data: updated
      });
    }

    // 2. Aksi User: Memberikan Rating & Ulasan (Status -> CLOSED)
    if (action === 'customer_rating') {
      const { skor, ulasan, aktor = 'Pengguna' } = body;

      if (!skor || skor < 1 || skor > 5) {
        return NextResponse.json(
          { success: false, message: 'Rating harus berupa angka 1 sampai 5' },
          { status: 400 }
        );
      }

      const updated = updateTicket(ticketId, {
        status: 'CLOSED',
        rating: {
          skor: Number(skor),
          ulasan: ulasan || 'Puas dengan penyelesaian dari Admin IT.',
          diberikan_pada: now
        }
      });

      addActivityLog(ticketId, {
        aktor,
        role: 'user',
        aksi: 'Rating & Ulasan Diberikan',
        keterangan: `Pengguna memberikan rating ${skor}/5 bintang. Ulasan: "${ulasan || '-'}"`
      });

      return NextResponse.json({
        success: true,
        message: 'Terima kasih atas rating dan ulasan Anda! Tiket resmi ditutup.',
        data: updated
      });
    }

    return NextResponse.json(
      { success: false, message: 'Aksi tidak dikenali' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memperbarui tiket' },
      { status: 500 }
    );
  }
}
