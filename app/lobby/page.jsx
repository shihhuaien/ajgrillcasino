"use client";

import Image from "next/image";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import Bridge from "@/components/Icons/Bridge";
import Login from "../login/page";
import { useState } from "react";
import { useRef } from "react";
import images from "@/lib/table";

const Home = () => {
  const loginButtonRef = useRef(null); // 創建 Ref 綁定 Login 按鈕
  const [selectedImage, setSelectedImage] = useState(null); // 儲存點擊的圖片物件

  const handleImageClick = (image) => {
    setSelectedImage(image); // 儲存點擊的圖片物件
    if (loginButtonRef.current) {
      loginButtonRef.current.click(); // 觸發按鈕的點擊事件
    }
  };

  return (
    <>
      <main className="mx-auto max-w-[1960px] p-4">
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
          <div className="after:content relative mb-5 flex h-[629px] flex-col items-center justify-center gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="flex max-h-full max-w-full items-center justify-center">
                <Bridge />
              </span>
              <span className="absolute left-0 right-0 bottom-0 h-[400px] bg-gradient-to-b from-black/0 via-black to-black"></span>
            </div>
            <div className="relative mt-12 flex flex-col items-center justify-center max-w-md mx-auto">
              <LoginForm
                image={selectedImage}
                loginButtonRef={loginButtonRef}
              />
            </div>
          </div>
          {images.slice(1).map((image) => (
            <button
              key={image.id}
              className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
              onClick={() => handleImageClick(image)} // 點擊時觸發
            >
              {" "}
              <Image
                alt={image.alt}
                className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
                style={{ transform: "translate3d(0, 0, 0)" }}
                src={image.src}
                width={720}
                height={480}
                sizes="(max-width: 640px) 100vw,
                  (max-width: 1280px) 50vw,
                  (max-width: 1536px) 33vw,
                  25vw"
              />
            </button>
          ))}
        </div>
      </main>
    </>
  );
};

export default Home;
