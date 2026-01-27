"use client";
import Image from "next/image";
import React from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

//when you get the images, import them statically like in DoneSection.tsx, key is alt
const images = [
    { src: "/images/kappamural.webp", alt: "Kappa Mural" },
    { src: "/images/dgmural.webp", alt: "DG Mural" },
    { src: "/images/samural.webp", alt: "Sigma Alpha Mural" },
    { src: "/images/thetamural.webp", alt: "Theta Mural" },
];

const WhatSection = () => {
    return (
        <section className="flex relative items-center justify-center mx-5">
            <div className="flex flex-col md:flex-row justify-center align-middle bg-primary w-full max-w-5xl border rounded-box p-5 md:p-7 gap-5 md:gap-7 transition duration-300 transform hover:scale-105">
                <div className="flex flex-col items-center justify-center md:w-1/2 rounded-xl max-h-[500px] md:max-h-none relative">
                    <div className="relative w-[350px] flex justify-center items-center">
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
                                            className="object-cover h-[350px] w-[350px]"
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-1/2 text-center md:text-left">
                    <h1 className="text-5xl text-base-content font-bold">What is Derby Days?</h1>
                    <p className="text-info-content text-sm md:text-base text-center">ABOUT</p>
                    <p className="text-base-content">
                        Derby Days is Sigma Chi&apos;s national philanthropy event. It&apos;s a spirited, month-long
                        competition that brings together fraternities, sororities, and the campus community to raise
                        funds for a meaningful cause. Through challenges, performances, team spirit, and campus
                        engagement, Derby Days unites fun with purpose. At its heart, Derby Days is about making a
                        difference. Every dollar raised supports Valley Childrens hospital, helping fund research,
                        provide care, and uplift lives. Derby Days is tradition, competition, and service all rolled
                        into one unforgettable week.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default WhatSection;
