import { CldImage } from "next-cloudinary";
import Image from "next/image";
import React from "react";

interface CloudOrNextImgProps {
    src: string;
    cloud: boolean;
    size: number;
    className?: string;
    alt: string;
}
const CloudOrNextImg = ({
    src,
    cloud,
    size,
    className,
    alt,
}: CloudOrNextImgProps) => {
    return cloud ? (
        <CldImage
            src={src}
            alt={alt}
            width={size}
            height={size}
            className={className}
        />
    ) : (
        <Image
            src={src}
            alt={alt}
            width={size}
            height={size}
            className={className}
        />
    );
};

export default CloudOrNextImg;
