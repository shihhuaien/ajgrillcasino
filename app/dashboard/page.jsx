"use client";

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState('');
  const [sid, setSid] = useState(null);

  // 使用 useEffect 來在客戶端獲取 sid
  useEffect(() => {
    const storedSid = sessionStorage.getItem('sid');
    console.log("Session ID:", storedSid); 
    if (storedSid) {
      setSid(storedSid);
    }
  }, []);

  // 查詢餘額
  const checkBalance = async () => {
    try {
      if (!sid) {
        alert('Session ID not found');
        return;
      }
  
      const res = await fetch('/api/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sid,
          userId: 'user123',
          currency: 'USD',
          uuid: 'unique-balance-id',
        }),
      });
  
      if (!res.ok) {
        console.error("Response Status:", res.status);
        throw new Error('Failed to fetch balance');
      }
      
      const data = await res.json();
      if (data.success) {
        setBalance(data.balance);
      } else {
        alert(data.message || 'Failed to fetch balance');
      }
    } catch (error) {
      console.error("Error:", error.message);
      alert('An error occurred: ' + error.message);
    }
  };

  // 投注
  const handleDebit = async () => {
    if (!sid) {
      alert('Session ID not found');
      return;
    }

    const res = await fetch('/api/debit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sid,
        userId: 'user123',
        transaction: { id: 'txn123', amount: parseFloat(amount) },
        currency: 'USD',
        uuid: 'unique-debit-id',
      }),
    });
    const data = await res.json();
    if (data.success) {
      setBalance(data.newBalance);
      alert('Bet placed successfully');
    } else {
      alert(data.message || 'Bet failed');
    }
  };

  // 結算
  const handleCredit = async () => {
    if (!sid) {
      alert('Session ID not found');
      return;
    }

    const res = await fetch('/api/credit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sid,
        userId: 'user123',
        transaction: { id: 'txn124', amount: parseFloat(amount) },
        currency: 'USD',
        uuid: 'unique-credit-id',
      }),
    });
    const data = await res.json();
    if (data.success) {
      setBalance(data.newBalance);
      alert('Credit successful');
    } else {
      alert(data.message || 'Credit failed');
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={checkBalance}>Check Balance</button>
      {balance !== null && <p>Current Balance: ${balance}</p>}

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleDebit}>Place Bet</button>
      <button onClick={handleCredit}>Credit Balance</button>
    </div>
  );
}
