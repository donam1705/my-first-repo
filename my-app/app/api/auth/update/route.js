import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function PUT(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, address, birthDate } = body;
    const data = {
      name,
      phone,
      address,
      birthDate: birthDate ? new Date(birthDate) : null,
    };

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    });

    return Response.json({ message: 'Cập nhật thành công', user: updated });
  } catch (error) {
    console.error('PUT /api/auth/update error:', error);
    return Response.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
