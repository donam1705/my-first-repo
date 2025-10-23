'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroBanner() {
  const slides = [
    {
      id: 1,
      title: 'Điện thoại ngon nhất 2025',
      subtitle: 'Giảm 100% trong tuần này',
      price: '12,345đ',
      image: '/uploads/placeholder.svg',
      link: '/products',
      discount: '100% OFF',
    },
    {
      id: 2,
      title: 'Laptóp ????????',
      subtitle: 'hahahahahaha',
      price: '1,234,567 đ',
      image: '/uploads/placeholder.svg',
      link: '/products',
      discount: '-250% OFF',
    },
    {
      id: 3,
      title: 'Phụ kiện và >>>',
      subtitle: 'Mua 1 tặng 2 !!!!!!',
      price: '24,680đ',
      image: '/uploads/placeholder.svg',
      link: '/products',
      discount: '-50% OFF',
    },
  ];

  return (
    <div className="relative w-full h-[450px] mb-12">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 4000 }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="flex flex-col md:flex-row items-center justify-between h-full bg-blue-50 px-10 md:px-20">
              <div className="max-w-xl space-y-4">
                <p className="text-gray-600 text-lg">
                  Giá chỉ từ: <span className="font-bold">{slide.price}</span>
                </p>
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                  {slide.title}
                </h2>
                <p className="text-gray-700 text-lg">
                  {slide.subtitle.replace('-10%', '')}
                </p>

                <Link
                  href={slide.link}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md shadow-md transition"
                >
                  Quất luôn đi
                </Link>
              </div>

              <div className="relative w-full md:w-[480px] h-64 md:h-[360px] mt-6 md:mt-0">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-contain"
                />

                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full px-4 py-2 text-sm shadow-md">
                  {slide.discount}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
