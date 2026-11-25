import { NextResponse } from 'next/server';
import { getUsers, createUser } from '@/lib/db';

export async function GET() {
  try {
    const users = getUsers();
    const safeUsers = users.map(({ password, ...u }) => u);
    return NextResponse.json({ success: true, data: safeUsers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data user' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, email, password, jabatan, role = 'user' } = body;

    if (!nama || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Nama, email, dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=4f46e5&color=fff&bold=true`;

    const newUser = createUser({
      nama: nama.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role === 'admin' ? 'admin' : 'user',
      avatar,
      jabatan: jabatan?.trim() || 'Karyawan / User'
    });

    const { password: _, ...safeUser } = newUser;

    return NextResponse.json({
      success: true,
      message: `User ${safeUser.nama} (${safeUser.email}) berhasil ditambahkan oleh Admin!`,
      data: safeUser
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menambahkan user' },
      { status: 400 }
    );
  }
}
