"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";

export default function ImageCarousel({ images, viewportSize }: { images: string[]; viewportSize: number }) {
    return (
        <Swiper
            className="px-8 md:px-16 w-full"
            modules={[Navigation, Autoplay, Pagination]}
            slidesPerView={1}
            loop
            speed={1000}
            autoplay={{ delay: 4000 }}
            navigation={{
                nextEl: ".custom-next",
                prevEl: ".custom-prev",
            }}
            pagination={{ clickable: true }}
        >
            {images.map((img) => (
                <SwiperSlide key={img}>
                    <div className="flex justify-center items-center">
                        <Image
                            src={img}
                            alt=""
                            width={400}
                            height={400}
                            className={`object-cover h-[${viewportSize}px] w-[${viewportSize}px]`}
                        />
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}
