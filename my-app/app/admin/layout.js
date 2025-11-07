import '../globals.css';
import SidebarAdmin from '@/components/admin/SidebarAdmin';
import ReactQueryProvider from '../providers/ReactQueryProvider';

export const metadata = {
  title: 'Admin Dashboard',
};

export default function AdminLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <ReactQueryProvider>
          <div className="flex bg-gray-50 min-h-screen">
            <SidebarAdmin />
            <main className="flex-1 ml-64 p-6">{children}</main>
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
