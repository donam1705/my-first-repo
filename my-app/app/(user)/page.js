import HeroBanner from '../../components/SwiperBanner';
import ProductItem from '../../components/ProductItem';
import CategoryShow from '../../components/CategoryShow';
import { getBaseUrl } from '@/lib/getBaseUrl';

async function getProducts() {
  const baseUrl = getBaseUrl();

  try {
    console.log('Fetching products from:', baseUrl);

    const res = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' });
    if (!res || !res.ok) {
      const statusCode = res?.status || 'unknown';
      console.error('API trả về lỗi:', statusCode);
      return [];
    }
    const data = await res.json();
    const products = Array.isArray(data) ? data : data.products || [];

    return products;
  } catch (error) {
    console.error(' Lỗi khi fetch sản phẩm:', error);
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <HeroBanner />
      <CategoryShow />
      <section className="mt-16">
        <p className="text-2xl font-bold text-gray-800 pb-6">Sản phẩm</p>
        {products.length === 0 ? (
          <p className="text-gray-500 text-center">Không có sản phẩm nào.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
