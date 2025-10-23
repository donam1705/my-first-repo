import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    const user = await getUserFromToken();
    if (!user)
      return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('avatar');

    if (!file) return Response.json({ error: 'Thiếu ảnh' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${user.id}-${Date.now()}.jpg`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

    await writeFile(filePath, buffer);

    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: `/uploads/${fileName}` },
    });

    return Response.json({
      message: 'Upload thành công',
      avatar: `/uploads/${fileName}`,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
