import { removeAuthCookie } from '@/lib/auth';

export async function POST() {
  removeAuthCookie();
  return Response.json({ message: 'Đăng xuất thành công' });
}
