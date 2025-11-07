import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    console.log('VNPay return raw query:', query);

    const secureHash = query.vnp_SecureHash;
    delete query.vnp_SecureHash;
    delete query.vnp_SecureHashType;

    const sorted = {};
    for (const key of Object.keys(query).sort()) {
      sorted[key] = encodeURIComponent(query[key]).replace(/%20/g, '+');
    }

    const signData = Object.keys(sorted)
      .map((k) => `${k}=${sorted[k]}`)
      .join('&');

    const signed = crypto
      .createHmac('sha512', VNP_HASH_SECRET)
      .update(signData, 'utf8')
      .digest('hex');

    if (secureHash !== signed) {
      console.error('Checksum không hợp lệ');
      return NextResponse.redirect(`${APP_URL}/payment/failed?reason=checksum`);
    }

    const txnRef = query.vnp_TxnRef;
    if (!txnRef) {
      console.error('Không có vnp_TxnRef trong query');
      return NextResponse.redirect(
        `${APP_URL}/payment/failed?reason=no_txnref`
      );
    }

    let order = null;
    const maybeId = parseInt(txnRef, 10);
    if (!Number.isNaN(maybeId)) {
      order = await prisma.order.findUnique({ where: { id: maybeId } });
    }
    if (!order) {
      order = await prisma.order.findFirst({ where: { txnRef } });
    }

    if (!order) {
      console.error('Không tìm thấy order cho txnRef:', txnRef);
      return NextResponse.redirect(
        `${APP_URL}/payment/failed?reason=order_not_found&ref=${encodeURIComponent(
          txnRef
        )}`
      );
    }

    const responseCode = query.vnp_ResponseCode || query.vnp_RespCode || '';
    if (responseCode === '00') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paymentStatus: 'paid',
          paymentMethod: 'VNPAY',
          paidAt: new Date(),
        },
      });
      return NextResponse.redirect(
        `${APP_URL}/payment/success?orderId=${order.id}`
      );
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED', paymentStatus: 'unpaid' },
      });
      return NextResponse.redirect(
        `${APP_URL}/payment/failed?orderId=${order.id}&code=${responseCode}`
      );
    }
  } catch (error) {
    console.error('Lỗi xử lý VNPay return:', error.message);
    return NextResponse.redirect(`${APP_URL}/payment/failed?reason=server`);
  }
}
