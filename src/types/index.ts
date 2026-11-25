export type UserRole = 'user' | 'admin';

export type TicketStatus = 
  | 'OPEN' 
  | 'IN_PROGRESS' 
  | 'PENDING' 
  | 'RESOLVED' 
  | 'CLOSED';

export type PriorityLevel = 'RENDAH' | 'SEDANG' | 'TINGGI' | 'KRITIS';
export type ImpactLevel = 'MINOR' | 'MODERAT' | 'MAYOR' | 'KRITIS';
export type Category = 'JARINGAN' | 'HARDWARE' | 'SOFTWARE' | 'AKUN_AKSES' | 'FASILITAS_LISTRIK' | 'LAINNYA';

export interface AIAnalysisResult {
  kategori: string;
  prioritas: PriorityLevel;
  perangkat: string;
  lokasi: string;
  dampak: string;
  ringkasan: string;
  saran_tindakan: string;
  model_used?: string;
  analyzed_at?: string;
}

export type AIStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

export interface Attachment {
  id: string;
  nama: string;
  url: string;
  tipe: string;
  ukuran?: string;
}

export interface ActivityLog {
  id: string;
  waktu: string;
  aktor: string;
  role: UserRole | 'system';
  aksi: string;
  keterangan: string;
}

export interface AdminHandling {
  status_review?: 'DISETUJUI' | 'DIKOREKSI';
  kategori_final?: string;
  prioritas_final?: PriorityLevel;
  catatan_admin?: string;
  diperiksa_oleh?: string;
  mulai_pada?: string;
  selesai_pada?: string;
  solusi?: string;
}

export interface Ticket {
  id: string;
  judul: string;
  pesan: string;
  perangkat: string;
  lokasi: string;
  lampiran: Attachment[];
  pengirim: {
    id: string;
    nama: string;
    email: string;
    avatar?: string;
  };
  status: TicketStatus;
  ai_status: AIStatus;
  ai_error?: string;
  ai_analysis?: AIAnalysisResult;
  penanganan?: AdminHandling;
  rating?: {
    skor: number; // 1-5
    ulasan: string;
    diberikan_pada: string;
  };
  riwayat_aktivitas: ActivityLog[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  nama: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar: string;
  jabatan?: string;
}
