import crypto from 'crypto';
import { NextResponse } from 'next/server';
import qs from 'qs';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    const { orderId, amount, orderInfo } = body;

    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    const vnpUrl = process.env.VNP_URL;
    const returnUrl =
      process.env.VNP_RETURN_URL ||
      (process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/vnpay_return`
        : 'http://localhost:3000/api/payment/vnpay_return');

    if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
      console.error('Thiếu cấu hình VNPay:', {
        tmnCode,
        secretKey,
        vnpUrl,
        returnUrl,
      });
      return NextResponse.json(
        { error: 'Thiếu cấu hình VNPay' },
        { status: 500 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });
    if (!order)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const date = new Date();
    const createDate = `${date.getFullYear()}${String(
      date.getMonth() + 1
    ).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(
      date.getHours()
    ).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(
      date.getSeconds()
    ).padStart(2, '0')}`;
    const txnRef = String(order.id);

    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: orderInfo || `Thanh toan don hang #${order.id}`,
      vnp_OrderType: 'other',
      vnp_Amount: String((amount ?? order.totalAmount) * 100),
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    const keys = Object.keys(vnp_Params).sort();
    const sortedParams = {};
    for (const k of keys) {
      sortedParams[k] = encodeURIComponent(vnp_Params[k]).replace(/%20/g, '+');
    }

    const signData = Object.keys(sortedParams)
      .map((k) => `${k}=${sortedParams[k]}`)
      .join('&');
    const signed = crypto
      .createHmac('sha512', secretKey)
      .update(signData, 'utf8')
      .digest('hex');

    const paymentUrl = `${vnpUrl}?${qs.stringify(sortedParams, {
      encode: false,
    })}&vnp_SecureHash=${signed}`;

    console.log('VNPay checkout signData:', signData);
    console.log('VNPay checkout signature:', signed);
    console.log('VNPay checkout URL:', paymentUrl);

    return NextResponse.json({ paymentUrl });
  } catch (err) {
    console.error('VNPay Checkout Error:', err);
    return NextResponse.json(
      { error: 'VNPay Checkout Failed' },
      { status: 500 }
    );
  }
}
