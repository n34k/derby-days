"use client";
import Image from "next/image";
import React from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const images = [
    { src: "/images/check2024.jpg", alt: "Check 2024" },
    { src: "/images/check2023.jpg", alt: "Check 2023" },
    { src: "/images/check2022.jpg", alt: "Check 2022" },
    { src: "/images/check2020.jpg", alt: "Check 2020" },
];

const DoneSection = () => {
    return (
        <section className="flex relative items-center justify-center mx-5">
            <div className="flex flex-col md:flex-row justify-center align-middle bg-primary w-full max-w-6xl border-1 border-secondary rounded-box p-5 md:p-7 gap-5 md:gap-0 transition duration-300 transform hover:scale-105">
                <div className="flex flex-col gap-3 w-full md:w-1/2 text-center md:text-left">
                    <h1 className="text-5xl text-base-content font-bold">
                        What We&apos;ve Done
                    </h1>
                    <p className="text-info-content text-sm md:text-base">
                        IMPACT
                    </p>
                    <p className="text-base-content">
                        Thanks to the unwavering dedication of our brothers, the
                        enthusiasm of participating sororities, and the
                        generosity of our donors, Sigma Chi Epsilon Eta has
                        raised more than $250,000 for Valley Children&apos;s
                        Hospital through Derby Days. But we&apos;re just getting
                        started. With your support, we can continue to grow this
                        tradition, make an even greater impact, and bring
                        brighter futures to the children and families who need
                        it most. Join us in writing the next chapter of
                        hope—every contribution brings us closer.
                    </p>
                </div>
                <div className="flex flex-col items-center justify-center w-full md:w-1/2 rounded-xl max-h-[500px] md:max-h-none relative">
                    <div className="relative w-full flex justify-center items-center">
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
                                <SwiperSlide key={img.src}>
                                    <div className="flex justify-center items-center">
                                        <Image
                                            src={img.src}
                                            alt={img.alt}
                                            width={400}
                                            height={400}
                                            className="object-cover rounded-lg h-[400px] w-[400px] border-1 border-info-content"
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DoneSection;
