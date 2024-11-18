"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Login = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [userNameError, setUserNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();

  const validateForm = () => {
    setUserNameError('');
    setPasswordError('');

    if (!userName) {
      setUserNameError('Please enter your user name');
      return false;
    }

    if (!password) {
      setPasswordError('Please enter your password');
      return false;
    } else if (password.length < 5) {
      setPasswordError('Password must be at least 5 characters');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      try {
        // 向 One Wallet API 發送登入請求
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: userName,
            password: password,
          }),
        });

        const data = await res.json();

        if (data.success) {
          // 將 sid 和其他需要的資訊儲存到 sessionStorage
          sessionStorage.setItem('sid', data.sid);
          if (data.authToken) {
            sessionStorage.setItem('authToken', data.authToken); // 儲存 authToken (若有)
          }
          router.push('/dashboard'); // 導到 /dashboard 頁面
        } else {
          alert(data.message || 'Login failed');
        }
      } catch (error) {
        console.error('Error logging in:', error);
        alert('An error occurred during login.');
      }
    }
  };

  return (
    <div className="mainContainer">
      <div className="titleContainer">Welcome to AJ grill casino</div>
      <div className="inputContainer">
        <input
          className="inputBox"
          type="text"
          placeholder="user name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        {userNameError && <label className="errorLabel">{userNameError}</label>}
      </div>
      <div className="inputContainer">
        <input
          className="inputBox"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {passwordError && <label className="errorLabel">{passwordError}</label>}
      </div>
      <div className="inputContainer">
        <button className="inputButton" onClick={handleLogin}>Log in</button>
      </div>
    </div>
  );
};

export default Login;
