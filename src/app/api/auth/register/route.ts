import { NextResponse } from 'next/server';
import { createUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, email, password, jabatan } = body;

    if (!nama || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Nama lengkap, email, dan password wajib diisi.' },
        { status: 400 }
      );
    }

    // Validasi format email dasar
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Format alamat email tidak valid.' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { success: false, message: 'Password minimal 4 karakter.' },
        { status: 400 }
      );
    }

    // Generate avatar url dinamis berdasarkan nama
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=2563eb&color=fff&bold=true`;

    const newUser = createUser({
      nama: nama.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      role: 'user',
      avatar,
      jabatan: jabatan?.trim() || 'Karyawan / Pengguna'
    });

    const { password: _, ...safeUser } = newUser;

    return NextResponse.json({
      success: true,
      message: `Akun ${safeUser.nama} berhasil didaftarkan!`,
      data: safeUser
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mendaftarkan user baru' },
      { status: 400 }
    );
  }
}
