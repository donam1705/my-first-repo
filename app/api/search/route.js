import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';

    if (!q) {
      return Response.json([]);
    }

    const allProducts = await prisma.product.findMany({
      include: { category: true },
      orderBy: { id: 'desc' },
      take: 20,
    });

    const products = allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(q.toLowerCase()))
    );

    return Response.json(products);
  } catch (error) {
    console.error('Lỗi khi GET /api/search:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
