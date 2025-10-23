import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new Response(JSON.stringify({ error: 'Chưa đăng nhập' }), {
        status: 401,
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Không tìm thấy người dùng' }),
        {
          status: 404,
        }
      );
    }

    return new Response(JSON.stringify({ user }), { status: 200 });
  } catch (err) {
    console.error('PROFILE API ERROR:', err);
    return new Response(
      JSON.stringify({ error: 'Token không hợp lệ hoặc đã hết hạn' }),
      { status: 401 }
    );
  }
}
