"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [userNameError, setUserNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 用於顯示動畫
  const router = useRouter();

  const validateForm = () => {
    setUserNameError("");
    setPasswordError("");

    if (!userName) {
      setUserNameError("Please enter your user name");
      return false;
    }

    if (!password) {
      setPasswordError("Please enter your password");
      return false;
    } else if (password.length < 5) {
      setPasswordError("Password must be at least 5 characters");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (validateForm()) {
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
          }),
        });

        if (!res.ok) {
          console.error("Response not OK:", res.status, res.statusText);
          alert("Login failed. Please try again.");
          setIsLoading(false);
          return;
        }

        const data = await res.json();

        if (data.success) {
          sessionStorage.setItem("sid", data.sid);
          if (data.authToken) {
            sessionStorage.setItem("authToken", data.authToken);
          }
          router.push(`https://diyow6.uat1.evo-test.com${data.authToken}`);
          setIsLoading(false);
        } else {
          alert(data.message || "Login failed");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error logging in:", error);
        alert("An error occurred during login.");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/platinum_prive_blackjack_banner_video_15_sec_2024_11.mp4"
        autoPlay
        loop
        muted
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
      {/* Login Form */}
      <div
        className="relative w-full max-w-md p-5 space-y-6 bg-gray-500 bg-opacity-50 rounded-lg shadow-lg"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleLogin(); // 按下 Enter 鍵觸發登入
          }
        }}
      >
        <h2 className="text-center text-2xl font-bold text-gray-100">
          Welcome to AJ Grill Casino
        </h2>
        <p className="text-center text-lg text-gray-300">
          Let's play the best games in the world!
        </p>
        <div className="space-y-4">
          <div>
            <input
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-600 text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              type="text"
              placeholder="User name"
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
              } rounded-md shadow-sm placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordError && (
              <p className="text-sm text-red-500 mt-1">{passwordError}</p>
            )}
          </div>
          <div>
            <button
              onClick={handleLogin}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center items-center"
              disabled={isLoading} // 登入處理中時禁用按鈕
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C6.48 0 0 6.48 0 12h4z"
                  ></path>
                </svg>
              ) : (
                "Log in"
              )}
            </button>
          </div>
        </div>
        <div className="text-sm text-center text-gray-600">
          <a href="#" className="font-medium text-gray-200 hover:text-gray-400">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
