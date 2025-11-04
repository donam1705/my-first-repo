import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { error: 'Thiếu email hoặc mật khẩu' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json({ error: 'Email không tồn tại' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Response.json({ error: 'Sai mật khẩu' }, { status: 400 });
    }

    if (!user.emailVerified) {
      return Response.json(
        { error: 'Email chưa xác minh. Vui lòng kiểm tra email!' },
        { status: 400 }
      );
    }

    const token = signToken({ id: user.id, email: user.email });

    cookies().set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
    });

    return Response.json({
      message: 'Đăng nhập thành công',
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('Login API Error:', error);
    return Response.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
