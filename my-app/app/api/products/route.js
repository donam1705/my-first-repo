import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    const where = categoryId ? { categoryId: Number(categoryId) } : {};

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { id: 'desc' },
    });

    return Response.json(products);
  } catch (error) {
    console.error('Lỗi GET /api/products:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.name || !body.sku || !body.categoryId) {
      return Response.json(
        { error: 'Thiếu dữ liệu bắt buộc' },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name: body.name,
        sku: body.sku,
        qty: Number(body.qty),
        price: Number(body.price),
        imageUrl: body.imageUrl,
        categoryId: Number(body.categoryId),
        description: body.description || null,
      },
    });

    return Response.json(newProduct);
  } catch (error) {
    console.error('Lỗi POST /api/products:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
