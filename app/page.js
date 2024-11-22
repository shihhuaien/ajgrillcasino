"use client";

import Image from "next/image";

export default function Home() {
  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[496px]">
          <button
            className="w-[100%] m-12 py-2 bg-gray-500 text-gray-900 rounded hover:bg-gray-700 flex items-center justify-center"
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            <Image
              src="/evolution_leaves_rgb.png"
              height={1000}
              width={1000}
              alt="evolution"
              className="w-6 h-6 mr-2"
            />
            Play Game
          </button>

          <div className="absolute left-0 bottom-0 text-14-regular mt-20 flex justify-between">
            <p className="justify-items-end text-dark-600 xl:text-left">
              © 2024 AFJ grill
            </p>
          </div>
        </div>
      </section>
      <Image
        src="/onboarding-img.png"
        height={1000}
        width={1300}
        alt="teacher"
        className="side-img max-w-[60%]"
      />
    </div>
  );
}
