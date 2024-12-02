"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 替換為 next/navigation
import { useRef } from "react";
import LoginForm from "@/components/LoginForm";

const Home = () => {
  // 靜態圖片數據
  const images = [
    { id: 1, src: "/images/photo0.png", alt: "Photo 1" },
    { id: 2, src: "/images/photo2.png", alt: "Photo 1" },
    { id: 3, src: "/images/photo2.png", alt: "Photo 1" },
    { id: 4, src: "/images/photo2.png", alt: "Photo 1" },
    { id: 5, src: "/images/photo0.png", alt: "Photo 1" },
    { id: 6, src: "/images/photo2.png", alt: "Photo 1" },
    { id: 7, src: "/images/photo2.png", alt: "Photo 1" },
    { id: 8, src: "/images/photo2.png", alt: "Photo 1" },
    { id: 9, src: "/images/photo2.png", alt: "Photo 1" },
    { id: 10, src: "/images/photo2.png", alt: "Photo 1" },
    { id: 11, src: "/images/photo2.png", alt: "Photo 1" },
  ];

  return (
    <>
      <Head>
        <title>Image Gallery</title>
      </Head>
      <main className="relative mx-auto max-w-[1960px] p-6">
        {/* Login Form */}
        <LoginForm />
        {/* Image Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {images.map(({ id, src, alt }) => (
            <Link key={id} href={`/?photoId=${id}`}>
              <Image
                alt={alt}
                className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
                style={{ transform: "translate3d(0, 0, 0)" }}
                src={src}
                width={720}
                height={480}
                sizes="(max-width: 640px) 100vw,
              (max-width: 1280px) 50vw,
              (max-width: 1536px) 33vw,
              25vw"
              />
            </Link>
          ))}
        </div>
      </main>
    </>
  );
};

export default Home;
