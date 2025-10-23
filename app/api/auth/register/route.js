import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { emailQueue } from '@/lib/queue';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { error: 'Thiếu email hoặc mật khẩu' },
        { status: 400 }
      );
    }

    const exist = await prisma.user.findUnique({ where: { email } });
    if (exist) {
      return Response.json({ error: 'Email đã tồn tại' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(40).toString('hex');

    const user = await prisma.user.create({
      data: { name, email, password: hashed, verifyToken },
    });

    const token = signToken({ id: user.id, email: user.email });
    cookies().set('token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    await emailQueue.add('sendVerification', {
      email,
      token: verifyToken,
    });

    return Response.json({
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.',
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
