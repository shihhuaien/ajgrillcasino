"use client";

import Image from "next/image";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import Bridge from "@/components/Icons/Bridge";
import { useState, useEffect } from "react";
import { useRef } from "react";

const Home = () => {
  const loginButtonRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [tableImages, setTableImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTableImages = async () => {
      try {
        const response = await fetch("/api/tables");
        const data = await response.json();
        // 篩選有有效圖片的桌子
        const filteredTables = (data.tables || []).filter(
          (table) =>
            table.src && table.src.trim() !== "" && isValidUrl(table.src)
        );
        setTableImages(filteredTables);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching table images:", error);
        setLoading(false);
      }
    };

    // 簡單的 URL 有效性檢查
    const isValidUrl = (string) => {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    };

    fetchTableImages();
  }, []);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    if (loginButtonRef.current) {
      loginButtonRef.current.click();
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
                source="subow"
              />
            </div>
          </div>
          {loading ? (
            <p>Loading tables...</p>
          ) : tableImages.length === 0 ? (
            <p>No tables with images available.</p>
          ) : (
            tableImages.map((image) => (
              <button
                key={image.id}
                className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
                onClick={() => handleImageClick(image)}
              >
                <Image
                  alt={image.alt || "Casino Table"}
                  className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
                  style={{ transform: "translate3d(0, 0, 0)" }}
                  src={image.src}
                  width={600}
                  height={400}
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw,
                    (max-width: 1280px) 50vw,
                    (max-width: 1536px) 33vw,
                    25vw"
                  onError={(e) => {
                    console.log(`Image load failed for ${image.src}`);
                    e.target.style.display = "none"; // 隱藏載入失敗的圖片
                  }}
                />
                {/* <p className="text-white text-center mt-2">{image.alt}</p>{" "} */}
                {/* 顯示桌子名稱 */}
              </button>
            ))
          )}
        </div>
      </main>
    </>
  );
};

export default Home;
