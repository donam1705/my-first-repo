import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    const categoryId = Number(params.id);
    if (!categoryId)
      return Response.json({ error: 'Thiếu ID danh mục' }, { status: 400 });

    const products = await prisma.product.findMany({
      where: { categoryId },
      include: { category: true },
      orderBy: { id: 'desc' },
    });

    return Response.json(products);
  } catch (err) {
    console.error('Lỗi API /categories/[id]/products:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const categoryId = Number(params.id);
    if (!categoryId)
      return Response.json({ error: 'Thiếu ID danh mục' }, { status: 400 });
    await prisma.product.deleteMany({
      where: { categoryId },
    });
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('Lỗi DELETE /categories/[id]:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
