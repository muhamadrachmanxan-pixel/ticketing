import { AIAnalysisResult, PriorityLevel } from '@/types';

export interface TicketInputForAI {
  judul: string;
  pesan: string;
  perangkat: string;
  lokasi: string;
}

/**
 * Heuristic fallback AI Analyzer:
 * Digunakan jika API key tidak tersedia, offline, atau jika terjadi error pada API external.
 */
export function heuristicAIAnalyze(input: TicketInputForAI): AIAnalysisResult {
  const text = `${input.judul} ${input.pesan} ${input.perangkat}`.toLowerCase();
  
  // 1. Tentukan Kategori
  let kategori = 'SOFTWARE';
  if (text.includes('wifi') || text.includes('internet') || text.includes('jaringan') || text.includes('lan') || text.includes('kabel') || text.includes('router') || text.includes('ip') || text.includes('down') || text.includes('rto')) {
    kategori = 'JARINGAN';
  } else if (text.includes('mati') || text.includes('rusak') || text.includes('layar') || text.includes('printer') || text.includes('laptop') || text.includes('pc') || text.includes('hardisk') || text.includes('ram') || text.includes('panas') || text.includes('bunyi') || text.includes('komputer')) {
    kategori = 'HARDWARE';
  } else if (text.includes('password') || text.includes('login') || text.includes('akun') || text.includes('email') || text.includes('akses') || text.includes('terkunci') || text.includes('reset')) {
    kategori = 'AKUN_AKSES';
  } else if (text.includes('listrik') || text.includes('ac') || text.includes('lampu') || text.includes('ups') || text.includes('genset') || text.includes('korsleting')) {
    kategori = 'FASILITAS_LISTRIK';
  } else if (text.includes('aplikasi') || text.includes('error') || text.includes('bug') || text.includes('crash') || text.includes('hang') || text.includes('windows') || text.includes('office') || text.includes('browser')) {
    kategori = 'SOFTWARE';
  }

  // 2. Tentukan Prioritas & Dampak
  let prioritas: PriorityLevel = 'SEDANG';
  let dampak = 'Moderat (Sebagian kecil pekerjaan terhambat)';

  const criticalKeywords = ['semua', 'seluruh', 'kantor', 'urgent', 'kritis', 'mati total', 'server down', 'transaksi gagal', 'kasir', 'darurat', 'direktur', 'ceo'];
  const highKeywords = ['tidak bisa kerja', 'deadline', 'bos', 'laporan', 'segera', 'penting', 'cepat'];
  const lowKeywords = ['tanya', 'info', 'panduan', 'minor', 'kosmetik', 'request baru', 'instalasi'];

  if (criticalKeywords.some(k => text.includes(k))) {
    prioritas = 'KRITIS';
    dampak = 'Kritis (Operasional utama terhenti total, mempengaruhi banyak pengguna)';
  } else if (highKeywords.some(k => text.includes(k))) {
    prioritas = 'TINGGI';
    dampak = 'Mayor (Pengguna tidak dapat melanjutkan pekerjaan mendesak)';
  } else if (lowKeywords.some(k => text.includes(k))) {
    prioritas = 'RENDAH';
    dampak = 'Minor (Pekerjaan umum masih dapat berjalan secara alternatif)';
  }

  // 3. Ringkasan
  const ringkasan = `Pengguna melaporkan kendala pada ${input.perangkat || 'perangkat'} di area ${input.lokasi || 'kantor'}: "${input.judul}". Masalah terindikasi terkait ${kategori.toLowerCase().replace('_', ' ')}.`;

  // 4. Rekomendasi Langkah Awal Penanganan
  let saran_tindakan = 'Periksa detail log kendala, hubungi pengguna untuk verifikasi awal, dan lakukan remote diagnosis bila memungkinkan.';
  if (kategori === 'JARINGAN') {
    saran_tindakan = '1. Cek status switch/router di area tersebut.\n2. Verifikasi alokasi DHCP IP & DNS.\n3. Uji konektivitas ping gateway lokal dan DNS public 8.8.8.8.';
  } else if (kategori === 'HARDWARE') {
    saran_tindakan = '1. Cek koneksi kabel daya dan adaptor unit.\n2. Lakukan inspeksi fisik pada perangkat.\n3. Siapkan unit cadangan/replacement jika diperlukan perbaikan komponen.';
  } else if (kategori === 'AKUN_AKSES') {
    saran_tindakan = '1. Verifikasi identitas pemohon di Active Directory / User Management.\n2. Lakukan pengecekan status lock out akun.\n3. Generate temporary password atau sinkronisasi ulang hak akses.';
  } else if (kategori === 'SOFTWARE') {
    saran_tindakan = '1. Minta screenshot pesan error spesifik jika belum terlampir.\n2. Bersihkan cache / restart service terkait.\n3. Cek versi build software dan pastikan update/patch kompatibel.';
  } else if (kategori === 'FASILITAS_LISTRIK') {
    saran_tindakan = '1. Koordinasi segera dengan tim ME (Mekanikal Elektrikal).\n2. Cek status baterai UPS & circuit breaker.\n3. Pastikan tidak ada beban berlebih.';
  }

  return {
    kategori,
    prioritas,
    perangkat: input.perangkat || 'Perangkat teridentifikasi dari laporan',
    lokasi: input.lokasi || 'Area pelapor',
    dampak,
    ringkasan,
    saran_tindakan,
    model_used: 'Built-in Intelligent Heuristic Engine',
    analyzed_at: new Date().toISOString()
  };
}

/**
 * Analisis Tiket Menggunakan AI (Gemini API dengan fallback Heuristic cerdas)
 */
export async function analyzeTicketWithAI(
  input: TicketInputForAI, 
  forceFailure: boolean = false
): Promise<AIAnalysisResult> {
  // Jika mode forceFailure diaktifkan (untuk simulasi error AI sesuai permintaan alur sistem)
  if (forceFailure) {
    throw new Error('Simulasi AI Error: Koneksi ke layanan AI API timeout atau gagal merespons.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  if (!apiKey || apiKey.trim() === '') {
    // Jalankan Heuristic Fallback jika API key belum diisi
    return heuristicAIAnalyze(input);
  }

  try {
    const prompt = `Anda adalah sistem AI IT Support Helpdesk & Triage Expert kelas dunia.
Tugas Anda adalah menganalisis tiket keluhan yang dilaporkan oleh pengguna dan mengekstrak parameter dalam format JSON yang valid dan baku.

DATA TIKET DARI PENGGUNA:
- Judul: "${input.judul}"
- Pesan Keluhan: "${input.pesan}"
- Perangkat: "${input.perangkat}"
- Lokasi: "${input.lokasi}"

ATURAN OUTPUT JSON:
Hanya kembalikan string JSON valid (tanpa markdown blok \`\`\`json) dengan struktur persis seperti berikut:
{
  "kategori": "PILIH_SATU: JARINGAN | HARDWARE | SOFTWARE | AKUN_AKSES | FASILITAS_LISTRIK | LAINNYA",
  "prioritas": "PILIH_SATU: KRITIS | TINGGI | SEDANG | RENDAH",
  "perangkat": "Nama perangkat spesifik hasil deteksi/konfirmasi",
  "lokasi": "Nama lokasi spesifik hasil deteksi/konfirmasi",
  "dampak": "Penjelasan singkat tingkat keparahan dampak terhadap operasional",
  "ringkasan": "Ringkasan 1-2 kalimat mengenai esensi masalah",
  "saran_tindakan": "3 poin langkah teknis awal untuk teknisi/operator"
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: Status ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Respons dari Gemini API kosong');
    }

    // Bersihkan formatting markdown jika ada
    const cleanedJson = candidateText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    return {
      kategori: parsed.kategori || 'SOFTWARE',
      prioritas: parsed.prioritas || 'SEDANG',
      perangkat: parsed.perangkat || input.perangkat,
      lokasi: parsed.lokasi || input.lokasi,
      dampak: parsed.dampak || 'Dampak sedang terhadap operasional',
      ringkasan: parsed.ringkasan || input.pesan.slice(0, 100),
      saran_tindakan: parsed.saran_tindakan || 'Hubungi pengguna untuk validasi kendala.',
      model_used: modelName,
      analyzed_at: new Date().toISOString()
    };
  } catch (err: any) {
    console.error('Error saat menghubungi AI API:', err.message);
    // Lempar error agar caller dapat menangkap dan memproses alur tiket "Menunggu klasifikasi manual"
    throw err;
  }
}
