"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Login = ({ image, loginButtonRef, source }) => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [userNameError, setUserNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [imageError, setImageError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    setUserNameError("");
    setPasswordError("");
    setImageError("");

    let isValid = true;

    if (!userName) {
      setUserNameError("請輸入您的使用者名稱");
      isValid = false;
    }

    if (!password) {
      setPasswordError("請輸入您的密碼");
      isValid = false;
    } else if (password.length < 5) {
      setPasswordError("密碼必須至少 5 個字元");
      isValid = false;
    }

    if (!image) {
      setImageError("請先選擇您喜愛的遊戲桌子");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return; // 如果驗證失敗，直接返回
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userName,
          password: password,
          image,
          source, // 新增 source 欄位
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("回應錯誤:", res.status, res.statusText, errorData);
        alert(errorData.message || "登入失敗，請再試一次。");
        setIsLoading(false);
        return;
      }

      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem("sid", data.sid);
        if (data.authToken) {
          sessionStorage.setItem("authToken", data.authToken);
        }

        let baseUrl;
        if (source === "ow") {
          baseUrl = "https://diyow6.uat1.evo-test.com";
        } else if (source === "subow") {
          baseUrl = "https://diyasmaster.uat1.evo-test.com";
        } else {
          // 如果 source 無效，設置默認值
          baseUrl = "https://diyow6.uat1.evo-test.com";
        }

        router.push(`${baseUrl}${data.authToken}`);
      } else {
        alert(data.message || "登入失敗");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("登入過程中發生錯誤:", error);
      alert("登入時發生錯誤，請稍後再試。");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* 背景影片（已註解） */}
      {/* <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/platinum_prive_blackjack_banner_video_15_sec_2024_11.mp4"
        autoPlay
        loop
        muted
      />
      <div className="absolute inset-0 bg-black opacity-50"></div> */}
      {/* 登入表單 */}
      <div
        className="relative w-full max-w-md p-5 space-y-6 bg-gray-500 bg-opacity-50 rounded-lg shadow-lg"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleLogin(); // 按下 Enter 鍵觸發登入
          }
        }}
      >
        <h2 className="text-center text-2xl font-bold text-gray-100">
          歡迎來到 AJ Grill
        </h2>

        <p className="text-center text-lg text-gray-300">請點選右邊的遊戲</p>
        <div className="space-y-4">
          <div>
            <input
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-600 text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              type="text"
              placeholder="使用者名稱"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            {userNameError && (
              <p className="text-sm text-red-500 mt-1">{userNameError}</p>
            )}
          </div>
          <div>
            <input
              className={`block w-full px-3 py-2 border ${
                passwordError ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm placeholder-gray-600 text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              type="password"
              placeholder="密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordError && (
              <p className="text-sm text-red-500 mt-1">{passwordError}</p>
            )}
          </div>
          {imageError && (
            <p className="text-sm text-red-500 mt-1">{imageError}</p>
          )}
          <div>
            <button
              ref={loginButtonRef}
              onClick={handleLogin}
              className="visibility: hidden w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C6.48 0 0 6.48 0 12h4z"
                  />
                </svg>
              ) : (
                "登入"
              )}
            </button>
          </div>
        </div>
        <div className="text-sm text-center text-gray-600">
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-white mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C6.48 0 0 6.48 0 12h4z"
              />
            </svg>
          ) : (
            <p className="font-medium text-gray-200 hover:text-gray-400">
              如果登入失敗，不要太擔心，再試一次可能就成功了
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
