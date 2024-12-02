"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const LoginForm = ({ className }) => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [userNameError, setUserNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
          body: JSON.stringify({ username: userName, password }),
        });

        if (res.ok) {
          const data = await res.json();
          sessionStorage.setItem("sid", data.sid);
          router.push("/");
        } else {
          alert("Login failed");
        }
      } catch (error) {
        console.error("Error logging in:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div
      className={`absolute top-8 left-8 w-[430px] h-[500px]  bg-gray-800 bg-opacity-90 p-6 rounded-lg shadow-lg text-white z-50 bg-[url('/images/photo1.png')] bg-cover bg-center`}
    >
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        {userNameError && (
          <p className="text-red-500 text-sm mt-1">{userNameError}</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {passwordError && (
          <p className="text-red-500 text-sm mt-1">{passwordError}</p>
        )}
      </div>
      <button
        onClick={handleLogin}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold flex justify-center items-center"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
};

export default LoginForm;
