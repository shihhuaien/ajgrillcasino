"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function MiniAppPage() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const tgRef = useRef(null);

  const initTelegram = useCallback(() => {
    const tg = window?.Telegram?.WebApp;
    if (!tg) return;

    tgRef.current = tg;

    // 建議：盡可能拉高視圖，並套主題色
    try {
      tg.expand();
      tg.setHeaderColor("secondary_bg_color");
    } catch {}

    // 顯示使用者（僅前端展示，勿視為已授權）
    const u = tg.initDataUnsafe?.user || null;
    setUser(u);

    // 設定 BottomButton
    tg.BottomButton.setText("送出並驗章");
    tg.BottomButton.show();

    // 點擊 BottomButton：把 initData 丟到伺服器驗章
    tg.onEvent("bottomButtonClicked", async () => {
      try {
        const res = await fetch("/api/tg-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData: tg.initData }),
        });
        const data = await res.json();
        if (data.valid) {
          tg.showAlert("驗證成功 ✅");
        } else {
          tg.showAlert(`驗證失敗 ❌\n${data.error || "請稍後重試"}`);
        }
      } catch (e) {
        tg.showAlert("網路錯誤，請稍後重試");
      }
    });

    // （可選）返回鍵
    tg.BackButton.show();
    tg.onEvent("backButtonClicked", () => {
      try {
        tg.close();
      } catch {}
    });

    setReady(true);
  }, []);

  return (
    <>
      {/* 載入 Telegram WebApp SDK */}
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
        onLoad={initTelegram}
      />

      <main className="min-h-dvh p-6 flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">Telegram Mini App</h1>
        <p className="opacity-80">
          {user
            ? `Hello, ${user.first_name}${
                user.last_name ? " " + user.last_name : ""
              }!`
            : "Hello, guest!（未取得使用者）"}
        </p>

        {!ready && <p>初始化中…</p>}

        {/* 額外：鍵盤按鈕情境可用 sendData 回傳 Bot */}
        <button
          className="px-4 py-2 rounded bg-black text-white"
          onClick={() => {
            const tg = tgRef.current;
            if (!tg?.sendData) return alert("此啟動方式不支援 sendData");
            tg.sendData(JSON.stringify({ foo: "bar", t: Date.now() }));
          }}
        >
          （可選）sendData 測試
        </button>
      </main>
    </>
  );
}
