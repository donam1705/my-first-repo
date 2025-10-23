import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    const id = Number(params.id);
    if (!id)
      return Response.json({ error: 'Thiếu ID danh mục' }, { status: 400 });

    const products = await prisma.product.findMany({
      where: { categoryId: id },
      include: { category: true },
      orderBy: { id: 'desc' },
    });

    return Response.json(products);
  } catch (error) {
    console.error('Lỗi GET /api/categories/[id]/products:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
