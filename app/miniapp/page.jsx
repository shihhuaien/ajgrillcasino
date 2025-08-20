"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function MiniAppPage() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [env, setEnv] = useState("checking"); // 'tg' | 'browser'
  const tgRef = useRef(null);
  const offHandlersRef = useRef([]);

  const init = useCallback(() => {
    const tg = window?.Telegram?.WebApp;
    if (!tg) {
      setEnv("browser");
      return;
    }
    setEnv("tg");
    tgRef.current = tg;

    // 推薦：宣告準備完成
    try {
      tg.ready();
      tg.expand();
      tg.setHeaderColor("secondary_bg_color");
    } catch {}

    // 顯示使用者（前端僅展示）
    const u = tg.initDataUnsafe?.user || null;
    setUser(u);

    // BottomButton
    try {
      tg.BottomButton.setText("送出並驗章");
      tg.BottomButton.show();
    } catch {}

    const onBottom = async () => {
      try {
        const res = await fetch("/api/tg-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData: tg.initData }),
        });
        const data = await res.json();
        if (data.valid) tg.showAlert("驗證成功 ✅");
        else tg.showAlert(`驗證失敗 ❌\n${data.error || "請稍後重試"}`);
      } catch {
        tg.showAlert("網路錯誤，請稍後重試");
      }
    };

    const onBack = () => {
      try {
        tg.close();
      } catch {}
    };

    // 事件掛載
    tg.onEvent("bottomButtonClicked", onBottom);
    tg.BackButton.show();
    tg.onEvent("backButtonClicked", onBack);

    // 記錄解除函式（Fast Refresh / 離開頁面時用）
    offHandlersRef.current.push(() =>
      tg.offEvent("bottomButtonClicked", onBottom)
    );
    offHandlersRef.current.push(() => tg.offEvent("backButtonClicked", onBack));

    setReady(true);
  }, []);

  // 1) Script 載入時初始化
  const onSdkLoad = useCallback(() => init(), [init]);

  // 2) 頁面載入後，如 SDK 已存在，也初始化（避免某些客戶端先注入）
  useEffect(() => {
    if (typeof window !== "undefined" && window?.Telegram?.WebApp) {
      init();
    } else {
      setEnv("browser"); // 先標記，等 Script 載入後會再覆蓋成 'tg'
    }
    return () => {
      // 清除事件與 UI
      offHandlersRef.current.forEach((fn) => {
        try {
          fn();
        } catch {}
      });
      offHandlersRef.current = [];
      try {
        const tg = tgRef.current;
        tg?.BottomButton?.hide();
        tg?.BackButton?.hide();
      } catch {}
    };
  }, [init]);

  return (
    <>
      {/* Telegram WebApp SDK */}
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
        onLoad={onSdkLoad}
      />

      <main className="min-h-dvh p-6 flex flex-col items-center justify-center gap-4">
        {/* 明顯識別（避免誤判是 Example Domain） */}
        <h1 className="text-2xl font-semibold">Mini App /miniapp — v1</h1>

        {/* 非 Telegram 環境的提示（可保留作為除錯） */}
        {env === "browser" && (
          <div className="rounded border p-3 text-sm opacity-80">
            <p>目前偵測不到 Telegram WebApp 環境。</p>
            <p>
              請從 Telegram 內以「主選單按鈕 / 內聯按鈕 / Reply
              Keyboard」開啟此頁。
            </p>
          </div>
        )}

        <p className="opacity-80">
          {user
            ? `Hello, ${user.first_name}${
                user.last_name ? " " + user.last_name : ""
              }!`
            : "Hello, guest!（尚未拿到 Telegram 使用者）"}
        </p>

        {!ready && <p>初始化中…</p>}

        {/* （可選）Reply Keyboard 情境測試 sendData */}
        <button
          className="px-4 py-2 rounded bg-black text-white"
          onClick={() => {
            const tg = tgRef.current;
            if (!tg?.sendData)
              return alert(
                "此啟動方式不支援 sendData（需要 Reply Keyboard 的 web_app 按鈕）"
              );
            tg.sendData(JSON.stringify({ foo: "bar", t: Date.now() }));
          }}
        >
          測試 sendData（Reply Keyboard）
        </button>
      </main>
    </>
  );
}
