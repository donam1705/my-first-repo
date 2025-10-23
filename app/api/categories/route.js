import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    return Response.json(categories);
  } catch (error) {
    console.error('Lỗi khi GET /api/categories:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.name || !body.name.trim()) {
      return Response.json(
        { error: 'Tên danh mục không được để trống' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: body.name,
        description: body.description || null,
      },
    });

    return Response.json(category, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi POST /api/categories:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
