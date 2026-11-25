import { NextResponse } from 'next/server';
import { findUserByCredentials } from '@/lib/db';
import { DEFAULT_USERS } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Email, password, dan tipe akun (role) wajib diisi' },
        { status: 400 }
      );
    }

    const user = findUserByCredentials(email, password, role);

    if (!user) {
      // Periksa apakah email terdaftar tapi beda role
      const allUsers = DEFAULT_USERS;
      const existInOtherRole = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existInOtherRole && existInOtherRole.role !== role) {
        return NextResponse.json(
          {
            success: false,
            message: `Akun ini terdaftar sebagai ${existInOtherRole.role.toUpperCase()}. Silakan login melalui portal ${existInOtherRole.role === 'admin' ? 'Admin' : 'User'}.`
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { success: false, message: 'Email atau password yang Anda masukkan salah.' },
        { status: 401 }
      );
    }

    // Return user info without password
    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      message: `Selamat datang, ${user.nama}!`,
      data: safeUser
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memproses login' },
      { status: 500 }
    );
  }
}
