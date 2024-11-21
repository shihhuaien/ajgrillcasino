"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [userNameError, setUserNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
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
          return;
        }

        const data = await res.json();

        if (data.success) {
          sessionStorage.setItem("sid", data.sid);
          if (data.authToken) {
            sessionStorage.setItem("authToken", data.authToken);
          }
          router.push("/dashboard");
        } else {
          alert(data.message || "Login failed");
        }
      } catch (error) {
        console.error("Error logging in:", error);
        alert("An error occurred during login.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Welcome to AJ Grill Casino
        </h2>
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
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Log in
            </button>
          </div>
        </div>
        <div className="text-sm text-center text-gray-600">
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
