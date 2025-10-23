import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    const id = Number(params.id);

    if (!id) {
      return Response.json({ error: 'Thiếu ID sản phẩm' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return Response.json(
        { error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    return Response.json(product);
  } catch (error) {
    console.error('Lỗi khi GET /api/products/[id]:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    console.log('aa');
    const id = Number(params.id);
    const body = await req.json();

    if (!id) {
      return Response.json({ error: 'Thiếu ID sản phẩm' }, { status: 400 });
    }

    if (!body.name || !body.sku) {
      return Response.json(
        { error: 'Thiếu thông tin bắt buộc (tên hoặc SKU)' },
        { status: 400 }
      );
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        sku: body.sku,
        price: Number(body.price),
        qty: Number(body.qty),
        imageUrl: body.imageUrl || null,
        categoryId: body.categoryId ? Number(body.categoryId) : null,
        description: body.description || null,
      },
      include: { category: true },
    });

    return Response.json(updated);
  } catch (error) {
    console.error('Lỗi khi PUT /api/products/[id]:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const id = Number(params.id);

    if (!id) {
      return Response.json({ error: 'Thiếu ID sản phẩm' }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });
    return Response.json({ message: 'Đã xóa sản phẩm thành công' });
  } catch (error) {
    console.error('Lỗi khi DELETE /api/products/[id]:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
