import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const vnpParams = Object.fromEntries(url.searchParams.entries());
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];
    const secretKey = process.env.VNP_HASH_SECRET;
    const sortedKeys = Object.keys(vnpParams).sort();
    const signData = sortedKeys
      .map((key) => `${key}=${vnpParams[key]}`)
      .join('&');

    const signed = crypto
      .createHmac('sha512', secretKey)
      .update(signData)
      .digest('hex');

    if (secureHash !== signed) {
      console.error('Chữ ký không hợp lệ');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const responseCode = vnpParams['vnp_ResponseCode'];
    const orderCode = vnpParams['vnp_TxnRef'];
    const amount = Number(vnpParams['vnp_Amount']) / 100;

    if (responseCode === '00') {
      console.log(`Thanh toán thành công đơn hàng ${orderCode}`);

      try {
        await prisma.order.updateMany({
          where: { id: Number(orderCode) },
          data: { status: 'PAID' },
        });
      } catch (dbErr) {
        console.warn('Không tìm thấy order trong DB hoặc lỗi cập nhật:', dbErr);
      }

      return NextResponse.json({
        success: true,
        message: 'Thanh toán thành công!',
        amount,
        code: orderCode,
      });
    } else {
      console.warn(`Giao dịch thất bại mã: ${responseCode}`);
      return NextResponse.json({
        success: false,
        message: 'Giao dịch thất bại hoặc bị hủy!',
        responseCode,
      });
    }
  } catch (err) {
    console.error('Lỗi xử lý VNPay Return:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
