import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return Response.json(
        { error: 'Sai email hoặc mật khẩu' },
        { status: 400 }
      );
    }
    if (!user.isVerified) {
      return Response.json(
        { error: 'Email chưa xác thực! Vui lòng kiểm tra hộp thư.' },
        { status: 400 }
      );
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return Response.json(
        { error: 'Sai email hoặc mật khẩu' },
        { status: 400 }
      );
    }

    const token = signToken({ id: user.id, email: user.email });
    cookies().set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return Response.json({ message: 'Đăng nhập thành công', user });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
