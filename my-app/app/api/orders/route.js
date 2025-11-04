import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import crypto from 'crypto';
import qs from 'qs';

export async function POST(req) {
  try {
    const user = await getUserFromToken();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { items, receiverName, phone, address } = await req.json();
    if (!items?.length)
      return NextResponse.json({ error: 'Giỏ hàng trống' }, { status: 400 });

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        receiverName,
        phone,
        address,
        totalAmount,
        status: 'PENDING',
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { vnpTxnRef: String(order.id) },
    });

    const vnp_TmnCode = process.env.VNP_TMN_CODE;
    const vnp_HashSecret = process.env.VNP_HASH_SECRET;
    const vnp_Url = process.env.VNP_URL;
    const vnp_ReturnUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/vnpay_return`
      : 'http://localhost:3000/api/payment/vnpay_return';
    const date = new Date();
    const createDate = `${date.getFullYear()}${String(
      date.getMonth() + 1
    ).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(
      date.getHours()
    ).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(
      date.getSeconds()
    ).padStart(2, '0')}`;

    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: String(order.id),
      vnp_OrderInfo: `Thanh toán đơn hàng #${order.id}`,
      vnp_OrderType: 'other',
      vnp_Amount: String(totalAmount * 100),
      vnp_ReturnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    const sortedKeys = Object.keys(vnp_Params).sort();
    const encodedSortedParams = {};
    for (const k of sortedKeys) {
      encodedSortedParams[k] = encodeURIComponent(vnp_Params[k]).replace(
        /%20/g,
        '+'
      );
    }

    const signData = Object.keys(encodedSortedParams)
      .map((k) => `${k}=${encodedSortedParams[k]}`)
      .join('&');
    const signature = crypto
      .createHmac('sha512', vnp_HashSecret)
      .update(signData, 'utf8')
      .digest('hex');

    const finalParams = { ...encodedSortedParams, vnp_SecureHash: signature };
    const paymentUrl = `${vnp_Url}?${qs.stringify(finalParams, {
      encode: false,
    })}`;

    return NextResponse.json({
      message: 'Tạo đơn hàng thành công',
      order,
      paymentUrl,
    });
  } catch (error) {
    console.error('Lỗi /api/orders POST:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getUserFromToken();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Lỗi GET /api/orders:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
