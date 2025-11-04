import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import qs from 'qs';

const VNP_TMN_CODE = process.env.VNP_TMN_CODE || 'MPIKNC50';
const VNP_HASH_SECRET =
  process.env.VNP_HASH_SECRET || 'QICIJLZJ991WU2099Q75T7M4SZS9S2RN';
const VNP_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const RETURN_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/vnpay_return`;

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
    const { orderId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });

    if (!order)
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng.' },
        { status: 404 }
      );

    if (order.status === 'PAID') {
      return NextResponse.json(
        { error: 'Đơn hàng đã được thanh toán rồi.' },
        { status: 400 }
      );
    }

    const date = new Date();
    const createDate = date
      .toISOString()
      .replace(/[-T:.Z]/g, '')
      .slice(0, 14);

    let vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: VNP_TMN_CODE,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: order.id,
      vnp_OrderInfo: `Thanh toán lại đơn hàng #${order.id}`,
      vnp_OrderType: 'other',
      vnp_Amount: order.totalAmount * 100,
      vnp_ReturnUrl: RETURN_URL,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const signed = crypto
      .createHmac('sha512', VNP_HASH_SECRET)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl = `${VNP_URL}?${qs.stringify(vnp_Params, {
      encode: false,
    })}`;

    return NextResponse.json({ paymentUrl });
  } catch (err) {
    console.error('Lỗi khi tạo lại thanh toán:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
