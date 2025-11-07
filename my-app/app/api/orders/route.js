import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import crypto from 'crypto';
import qs from 'qs';

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
  }
  return sorted;
}

export async function POST(req) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      console.error(' Không tìm thấy user (token không hợp lệ)');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, receiverName, phone, address } = await req.json();

    if (!items?.length) {
      console.error('Giỏ hàng trống');
      return NextResponse.json({ error: 'Giỏ hàng trống' }, { status: 400 });
    }

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        receiverName,
        phone,
        address,
        totalAmount,
        status: 'PENDING',
        paymentMethod: 'VNPAY',
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      },
    });

    const vnp_TmnCode = process.env.VNP_TMN_CODE || 'MPIKNC50';
    const vnp_HashSecret =
      process.env.VNP_HASH_SECRET || 'QICIJLZJ991WU2099Q75T7M4SZS9S2RN';
    const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const vnp_ReturnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/vnpay_return`;

    const date = new Date();
    const createDate = date
      .toISOString()
      .replace(/[-T:.Z]/g, '')
      .slice(0, 14);
    const orderRef = String(order.id);

    let vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderRef,
      vnp_OrderInfo: `Thanh toán đơn hàng #${order.id}`,
      vnp_OrderType: 'other',
      vnp_Amount: totalAmount * 100,
      vnp_ReturnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const signed = crypto
      .createHmac('sha512', vnp_HashSecret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl = `${vnp_Url}?${qs.stringify(vnp_Params, {
      encode: false,
    })}`;

    console.log('Đơn hàng mới:', order);
    console.log('URL thanh toán VNPay:', paymentUrl);

    return NextResponse.json({
      message: 'Tạo đơn hàng và liên kết thanh toán thành công',
      order,
      paymentUrl,
    });
  } catch (error) {
    console.error('Lỗi /api/orders:', error.message);
    console.error(error.stack);
    return NextResponse.json(
      { error: 'Lỗi máy chủ', detail: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getUserFromToken();
    if (!user) {
      console.warn('Không có quyền truy cập (chưa đăng nhập)');
      return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Trả về ${orders.length} đơn hàng cho user #${user.id}`);

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Lỗi GET /api/orders:', error.message);
    return NextResponse.json(
      { error: 'Server Error', detail: error.message },
      { status: 500 }
    );
  }
}
