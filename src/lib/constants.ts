import { AuthUser } from '@/types';

export const DEFAULT_USERS: AuthUser[] = [
  {
    id: 'USR-01',
    nama: 'Ahmad Dahlan',
    email: 'user@perusahaan.co.id',
    password: 'user123',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    jabatan: 'Staf Divisi Akuntansi'
  },
  {
    id: 'USR-02',
    nama: 'Siti Rahmawati',
    email: 'siti@perusahaan.co.id',
    password: 'user123',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    jabatan: 'Desainer Marketing Hub'
  },
  {
    id: 'ADM-01',
    nama: 'Hendra Gunawan',
    email: 'admin@perusahaan.co.id',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    jabatan: 'Lead IT Administrator'
  }
];
