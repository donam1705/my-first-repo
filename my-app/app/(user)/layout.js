import Footer from '@/components/Footer';
import Header from '@/components/Header';
import '../globals.css';

export const metadata = {
  title: 'MyShop',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 text-gray-800">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
