import fs from 'fs';
import path from 'path';
import { Ticket, AuthUser, ActivityLog } from '@/types';
import { DEFAULT_USERS } from '@/lib/constants';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: AuthUser[];
  tickets: Ticket[];
}

const DEFAULT_TICKETS: Ticket[] = [
  {
    id: 'TKT-202611-001',
    judul: 'Koneksi WiFi Lantai 3 Tidak Bisa Akses Internet',
    pesan: 'Semua laptop di ruang divisi Akuntansi Lantai 3 tiba-tiba terputus dari WiFi Corp-L3. Status terhubung tapi No Internet Access sejak pukul 10:00.',
    perangkat: 'Access Point Aruba AP-505 & Switch Cisco 24-Port',
    lokasi: 'Gedung A, Lantai 3, Ruang Akuntansi & Keuangan',
    lampiran: [],
    pengirim: {
      id: 'USR-01',
      nama: 'Ahmad Dahlan',
      email: 'user@perusahaan.co.id',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    },
    status: 'OPEN',
    ai_status: 'SUCCESS',
    ai_analysis: {
      kategori: 'JARINGAN',
      prioritas: 'KRITIS',
      perangkat: 'Access Point Aruba AP-505 & Switch Cisco',
      lokasi: 'Gedung A, Lantai 3, Ruang Akuntansi',
      dampak: 'Kritis (Seluruh staf departemen keuangan tidak dapat memproses invoice & transaksi)',
      ringkasan: 'Gangguan internet massal di Divisi Akuntansi Lt 3 akibat koneksi AP/Switch terputus.',
      saran_tindakan: '1. Cek PoE Switch port untuk AP Lantai 3.\n2. Verifikasi gateway subnet VLAN Keuangan.\n3. Lakukan reboot AP jika lease DHCP penuh.',
      model_used: 'AI Intelligent Engine',
      analyzed_at: '2026-11-19T10:05:00Z'
    },
    riwayat_aktivitas: [
      {
        id: 'ACT-01',
        waktu: '2026-11-19T10:02:14Z',
        aktor: 'Ahmad Dahlan',
        role: 'user',
        aksi: 'Tiket Dibuat',
        keterangan: 'User mengirim formulir laporan kendala'
      },
      {
        id: 'ACT-02',
        waktu: '2026-11-19T10:02:16Z',
        aktor: 'AI Engine',
        role: 'system',
        aksi: 'Analisis AI Berhasil',
        keterangan: 'Kategori: JARINGAN, Prioritas: KRITIS, Dampak: Kritis'
      }
    ],
    createdAt: '2026-11-19T10:02:14Z',
    updatedAt: '2026-11-19T10:02:16Z'
  },
  {
    id: 'TKT-202611-002',
    judul: 'Layar Laptop Lenovo Muncul Garis Hijau & Berkedip',
    pesan: 'Laptop kerja saya tiba-tiba layarnya flicker dan bergaris hijau vertikal saat rendering video presentasi.',
    perangkat: 'Laptop Lenovo ThinkPad T14 Gen 3 (No. Aset: NB-084)',
    lokasi: 'Gedung B, Lantai 2, Marketing Creative Hub',
    lampiran: [],
    pengirim: {
      id: 'USR-02',
      nama: 'Siti Rahmawati',
      email: 'siti@perusahaan.co.id',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
    },
    status: 'IN_PROGRESS',
    ai_status: 'SUCCESS',
    ai_analysis: {
      kategori: 'HARDWARE',
      prioritas: 'SEDANG',
      perangkat: 'Laptop Lenovo ThinkPad T14',
      lokasi: 'Gedung B, Lantai 2, Marketing',
      dampak: 'Moderat (Pengguna mengalami kesulitan visual tapi data laptop masih aman)',
      ringkasan: 'Kerusakan flexibel atau display panel LCD pada unit ThinkPad T14 saat beban kerja grafis.',
      saran_tindakan: '1. Uji koneksi ke monitor eksternal HDMI untuk memastikan GPU normal.\n2. Lakukan inspeksi engsel & kabel LVDS LCD.\n3. Siapkan panel pengganti jika garis menetap.',
      model_used: 'AI Intelligent Engine',
      analyzed_at: '2026-11-19T09:15:00Z'
    },
    penanganan: {
      status_review: 'DISETUJUI',
      kategori_final: 'HARDWARE',
      prioritas_final: 'SEDANG',
      catatan_admin: 'Admin sedang menguji display dengan monitor eksternal dan membongkar frame LCD.',
      diperiksa_oleh: 'Hendra Gunawan (Admin IT)',
      mulai_pada: '2026-11-19T09:25:00Z'
    },
    riwayat_aktivitas: [
      {
        id: 'ACT-03',
        waktu: '2026-11-19T09:10:00Z',
        aktor: 'Siti Rahmawati',
        role: 'user',
        aksi: 'Tiket Dibuat',
        keterangan: 'User mengirim tiket keluhan hardware'
      },
      {
        id: 'ACT-04',
        waktu: '2026-11-19T09:25:00Z',
        aktor: 'Hendra Gunawan (Admin)',
        role: 'admin',
        aksi: 'Diproses oleh Admin',
        keterangan: 'Admin memverifikasi rekomendasi AI dan memulai proses perbaikan'
      }
    ],
    createdAt: '2026-11-19T09:10:00Z',
    updatedAt: '2026-11-19T09:25:00Z'
  },
  {
    id: 'TKT-202611-003',
    judul: 'Printer Kantor Epson L3110 Macet Paper Jam Terus',
    pesan: 'Printer di meja administrasi tidak bisa menarik kertas dan mengeluarkan suara keras gear selip.',
    perangkat: 'Printer Epson EcoTank L3110',
    lokasi: 'Lantai 1, Ruang Resepsionis & HR',
    lampiran: [],
    pengirim: {
      id: 'USR-01',
      nama: 'Ahmad Dahlan',
      email: 'user@perusahaan.co.id',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    },
    status: 'RESOLVED',
    ai_status: 'SUCCESS',
    ai_analysis: {
      kategori: 'HARDWARE',
      prioritas: 'RENDAH',
      perangkat: 'Printer Epson L3110',
      lokasi: 'Lantai 1, Resepsionis & HR',
      dampak: 'Minor (Cetak dokumen mendesak bisa dialihkan sementara ke printer Lantai 2)',
      ringkasan: 'Paper feed roller macet atau terdapat serpihan kertas/benda asing di paper tray.',
      saran_tindakan: '1. Buka penutup belakang dan periksa sensor roller.\n2. Bersihkan karet penarik kertas dari debu.\n3. Lakukan uji print test page.',
      model_used: 'AI Intelligent Engine',
      analyzed_at: '2026-11-19T08:00:00Z'
    },
    penanganan: {
      status_review: 'DISETUJUI',
      kategori_final: 'HARDWARE',
      prioritas_final: 'RENDAH',
      catatan_admin: 'Pembersihan mekanik selesai.',
      diperiksa_oleh: 'Hendra Gunawan (Admin IT)',
      mulai_pada: '2026-11-19T08:15:00Z',
      selesai_pada: '2026-11-19T08:45:00Z',
      solusi: 'Klip kertas yang tersangkut di roller telah dikeluarkan, karet penarik dibersihkan, cetak 10 lembar dokumen lancar tanpa kendala.'
    },
    riwayat_aktivitas: [
      {
        id: 'ACT-05',
        waktu: '2026-11-19T08:00:00Z',
        aktor: 'Ahmad Dahlan',
        role: 'user',
        aksi: 'Tiket Dibuat',
        keterangan: 'Keluhan paper jam'
      },
      {
        id: 'ACT-06',
        waktu: '2026-11-19T08:45:00Z',
        aktor: 'Hendra Gunawan (Admin)',
        role: 'admin',
        aksi: 'Tiket Selesai (Resolved)',
        keterangan: 'Admin telah menyelesaikan perbaikan printer. Menunggu rating dari User.'
      }
    ],
    createdAt: '2026-11-19T08:00:00Z',
    updatedAt: '2026-11-19T08:45:00Z'
  },
  {
    id: 'TKT-202611-004',
    judul: 'Laporan Kerusakan Tidak Terduga (Simulasi AI Error)',
    pesan: 'Perangkat khusus laboratorium telemetri menunjukkan indikator merah tidak dikenal setelah pemadaman listrik berkala.',
    perangkat: 'Modul Telemetri IoT Sensor Rack X-9',
    lokasi: 'Laboratorium R&D Lantai 4',
    lampiran: [],
    pengirim: {
      id: 'USR-02',
      nama: 'Siti Rahmawati',
      email: 'siti@perusahaan.co.id',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
    },
    status: 'OPEN',
    ai_status: 'FAILED',
    ai_error: 'Layanan AI eksternal sedang mengalami timeout jaringan.',
    riwayat_aktivitas: [
      {
        id: 'ACT-07',
        waktu: '2026-11-19T11:00:00Z',
        aktor: 'Siti Rahmawati',
        role: 'user',
        aksi: 'Tiket Dibuat',
        keterangan: 'Tiket tersimpan aman di database'
      },
      {
        id: 'ACT-08',
        waktu: '2026-11-19T11:00:02Z',
        aktor: 'AI Engine',
        role: 'system',
        aksi: 'Analisis AI Gagal',
        keterangan: 'Tiket dialihkan ke status Menunggu Klasifikasi Manual oleh Admin IT'
      }
    ],
    createdAt: '2026-11-19T11:00:00Z',
    updatedAt: '2026-11-19T11:00:02Z'
  }
];

function ensureDbExists(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    const initialData: DatabaseSchema = {
      users: DEFAULT_USERS,
      tickets: DEFAULT_TICKETS
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    if (!parsed.users) parsed.users = DEFAULT_USERS;
    return parsed;
  } catch (err) {
    const initialData: DatabaseSchema = {
      users: DEFAULT_USERS,
      tickets: DEFAULT_TICKETS
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function saveDb(data: DatabaseSchema): void {
  ensureDbExists();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function getUsers(): AuthUser[] {
  const db = ensureDbExists();
  return db.users;
}

export function createUser(userData: Omit<AuthUser, 'id'>): AuthUser {
  const db = ensureDbExists();
  const existing = db.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existing) {
    throw new Error(`Alamat email ${userData.email} sudah terdaftar.`);
  }

  const newUser: AuthUser = {
    ...userData,
    id: `USR-${Date.now().toString().slice(-4)}`
  };

  db.users.push(newUser);
  saveDb(db);
  return newUser;
}

export function findUserByCredentials(email: string, pass: string, role: string): AuthUser | null {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
  if (!user) return null;
  if (user.password && user.password !== pass) return null;
  return user;
}

export function getTickets(): Ticket[] {
  const db = ensureDbExists();
  return db.tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getTicketById(id: string): Ticket | undefined {
  const db = ensureDbExists();
  return db.tickets.find(t => t.id === id);
}

export function createTicket(ticket: Ticket): Ticket {
  const db = ensureDbExists();
  db.tickets.unshift(ticket);
  saveDb(db);
  return ticket;
}

export function updateTicket(id: string, updates: Partial<Ticket>): Ticket | null {
  const db = ensureDbExists();
  const index = db.tickets.findIndex(t => t.id === id);
  if (index === -1) return null;

  db.tickets[index] = {
    ...db.tickets[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  saveDb(db);
  return db.tickets[index];
}

export function addActivityLog(ticketId: string, log: Omit<ActivityLog, 'id' | 'waktu'>): void {
  const db = ensureDbExists();
  const index = db.tickets.findIndex(t => t.id === ticketId);
  if (index === -1) return;

  const newLog: ActivityLog = {
    ...log,
    id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    waktu: new Date().toISOString()
  };

  db.tickets[index].riwayat_aktivitas.unshift(newLog);
  db.tickets[index].updatedAt = new Date().toISOString();
  saveDb(db);
}

export function generateTicketId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `TKT-${dateStr}-${randomSuffix}`;
}
