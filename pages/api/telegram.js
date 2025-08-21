import fetch from "node-fetch";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const QUESTIONNAIRE_LINK =
  "https://docs.google.com/sheets/d/1RCPZDEmz1xotlvCyAqg1sz5JKtg-PorwboY4NqRKbD8/edit?gid=243266798#gid=243266798";

// 新增函數：設定命令選單及主選單按鈕
async function setBotCommandsAndMenuButton() {
  if (!TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN 未設置");
    return;
  }

  // --- 設定命令選單 ---
  const setCommandsUrl = `https://api.telegram.org/bot${TOKEN}/setMyCommands`;
  const commands = [
    { command: "start", description: "開始使用機器人" },
    { command: "help", description: "查看指令列表" },
    { command: "echo", description: "回覆相同訊息" },
    { command: "random", description: "隨機數字" },
    { command: "photo", description: "發送圖片" },
    { command: "buttons", description: "顯示內聯按鈕 (Inline Keyboard)" }, // 修改描述
    { command: "menu", description: "顯示常用選單 (Reply Keyboard)" }, // 新增命令
    { command: "questionnaire", description: "發送問卷連結（僅限群組）" },
  ];
  const commandsPayload = {
    commands: JSON.stringify(commands),
  };

  try {
    const response = await fetch(setCommandsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commandsPayload),
    });
    const result = await response.json();
    if (result.ok) {
      console.log("✅ 命令選單設定成功");
    } else {
      console.error("❌ 無法設定命令選單:", result.description);
    }
  } catch (error) {
    console.error("❌ 設定命令選單時發生錯誤:", error);
  }

  // // --- 設定主選單按鈕 (MenuButton) ---
  // const setMenuButtonUrl = `https://api.telegram.org/bot${TOKEN}/setChatMenuButton`;
  // const menuButtonPayload = {
  //   type: "web_app",
  //   text: "Open Mini App",
  //   web_app: { url: "https://ajgrillcasino.vercel.app/miniapp" },
  // };

  try {
    const response = await fetch(setMenuButtonUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(menuButtonPayload),
    });
    const result = await response.json();
    if (result.ok) {
      console.log("✅ 選單按鈕設定成功 (Commands)");
    } else {
      console.error("❌ 無法設定選單按鈕:", result.description);
    }
  } catch (error) {
    console.error("❌ 設定選單按鈕時發生錯誤:", error);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  console.log("🔍 收到請求:", JSON.stringify(req.body, null, 2));
  const body = req.body;

  if (body.message && !global.commandsAndMenuButtonSet) {
    await setBotCommandsAndMenuButton();
    global.commandsAndMenuButtonSet = true;
  }

  if (!body.message) {
    if (body.callback_query) {
      console.log("🔍 收到 Callback Query:", body.callback_query.data);
      const chatId = body.callback_query.message.chat.id;
      const callbackData = body.callback_query.data;

      if (callbackData === "random") {
        const randomNum = Math.floor(Math.random() * 100) + 1;
        await sendMessage(chatId, `🎲 你的隨機數字是: ${randomNum}`);
      } else if (callbackData === "photo") {
        await sendPhoto(chatId);
      }
      await answerCallbackQuery(body.callback_query.id);
    } else {
      console.log("ℹ️ 收到非訊息更新或沒有 message 字段的更新:", body);
    }
    return res
      .status(200)
      .json({ status: "No message found or other update type" });
  }

  // ✅ 先處理 Mini App 的 sendData（僅 Reply Keyboard 開啟時會收到）
  if (body.message?.web_app_data?.data) {
    const chatId = body.message.chat.id;
    const raw = body.message.web_app_data.data; // 這是前端 tg.sendData(...) 的字串

    // (可選) 嘗試 JSON 解析，兼容純字串
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch {}

    // 你可以在這裡把資料丟到 DB / 你的後端邏輯
    // 例如：await saveMiniAppPayload(chatId, parsed ?? raw);

    await sendMessage(
      chatId,
      `✅ 已收到 Mini App 資料：\n` +
        (parsed ? "```json\n" + JSON.stringify(parsed, null, 2) + "\n```" : raw)
    );

    // ⭐ 這很重要：處理完就結束，避免落入文字指令分支
    return res.status(200).json({ status: "web_app_data processed" });
  }

  const chatId = body.message.chat.id;
  const messageText = body.message.text;

  if (messageText) {
    console.log("📩 收到 Telegram 訊息:", messageText);

    const isGroup =
      body.message.chat.type === "group" ||
      body.message.chat.type === "supergroup";

    // 根據不同的指令執行對應動作
    if (messageText === "/start") {
      await sendMessage(
        chatId,
        "🤖 歡迎使用 Telegram 機器人！請輸入 /help 查看指令列表。"
      );
    } else if (messageText === "/help") {
      await sendMessage(
        chatId,
        "📖 機器人支援的指令：\n" +
          "/start - 開始使用機器人\n" +
          "/help - 查看指令列表\n" +
          "/echo <message> - 回覆相同訊息\n" +
          "/random - 隨機數字\n" +
          "/photo - 發送圖片\n" +
          "/buttons - 顯示內聯按鈕\n" +
          "/menu - 顯示常用選單\n" + // 新增幫助訊息
          "/questionnaire - 發送問卷連結（僅限群組）"
      );
    } else if (messageText.startsWith("/echo@Evolution_Tim_Bot")) {
      const reply = messageText.replace("/echo ", "");
      await sendMessage(chatId, `🔁 你說: ${reply}`);
    } else if (messageText === "/random") {
      const randomNum = Math.floor(Math.random() * 100) + 1;
      await sendMessage(chatId, `🎲 你的隨機數字是: ${randomNum}`);
    } else if (messageText === "/photo") {
      await sendPhoto(chatId);
    } else if (messageText === "/miniapp") {
      await sendMiniAppInlineButton(chatId);
    } else if (messageText === "/questionnaire" && isGroup) {
      await sendQuestionnaire(chatId);
    } else if (messageText === "/menu") {
      // 處理新命令
      await sendReplyKeyboardWithMiniApp(chatId);
    } else if (messageText === "隨機數字") {
      // 處理 Reply Keyboard 按鈕點擊
      const randomNum = Math.floor(Math.random() * 100) + 1;
      await sendMessage(chatId, `🎲 你的隨機數字是: ${randomNum}`);
    } else if (messageText === "發送圖片") {
      // 處理 Reply Keyboard 按鈕點擊
      await sendPhoto(chatId);
    } else if (messageText === "問卷連結") {
      // 處理 Reply Keyboard 按鈕點擊
      // 注意：問卷連結是群組專用，但這裡為了演示 Reply Keyboard，在私聊也會發送連結。
      // 您可能需要根據 chat.type 判斷是否發送此連結。
      await sendQuestionnaire(chatId);
    } else if (messageText === "隱藏選單") {
      // 處理 Reply Keyboard 按鈕點擊
      await hideReplyKeyboard(chatId);
    } else {
      console.log("ℹ️ 收到未識別的文字訊息:", messageText);
      await sendMessage(
        chatId,
        "😕 抱歉，我不太明白您的意思。請輸入 /help 查看指令列表。"
      );
    }
  } else {
    console.log(
      "ℹ️ 收到非文字訊息的 message 更新，不進行文字指令處理:",
      body.message
    );
  }

  res.status(200).json({ status: "Message processed" });
}

// 發送一般文字訊息 (可接受 reply_markup)
async function sendMessage(chatId, text, replyMarkup = null) {
  // 增加 replyMarkup 參數
  if (!TOKEN) return console.error("❌ TELEGRAM_BOT_TOKEN 未設置");

  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const payload = { chat_id: chatId, text, parse_mode: "Markdown" };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) console.error("❌ 無法發送訊息:", await response.text());
  } catch (error) {
    console.error("❌ 發送訊息時發生錯誤:", error);
  }
}

// 發送問卷連結
async function sendQuestionnaire(chatId) {
  const message = `您好，請填寫 Questionnaire 表單供串接使用，若填寫過程有任何問題，歡迎隨時在群組提問，謝謝。\n\n${QUESTIONNAIRE_LINK}`;
  await sendMessage(chatId, message);
}

// 發送圖片
async function sendPhoto(chatId) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendPhoto`;
  const payload = {
    chat_id: chatId,
    photo: "https://source.unsplash.com/random/600x400",
    caption: "📷 這是一張隨機圖片",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) console.error("❌ 無法發送圖片:", await response.text());
  } catch (error) {
    console.error("❌ 發送圖片時發生錯誤:", error);
  }
}

// 發送內聯按鈕 (Inline Keyboard) - 原 sendButtons 更名
async function sendInlineButtons(chatId) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: "🚀 請選擇一個選項：",
    reply_markup: {
      inline_keyboard: [
        [{ text: "📄 問卷", url: QUESTIONNAIRE_LINK }],
        [{ text: "🎲 隨機數字", callback_data: "random" }],
        [{ text: "📷 隨機圖片", callback_data: "photo" }],
      ],
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok)
      console.error("❌ 無法發送內聯按鈕:", await response.text());
  } catch (error) {
    console.error("❌ 發送內聯按鈕時發生錯誤:", error);
  }
}

// **新增：發送回覆鍵盤 (Reply Keyboard)**
async function sendReplyKeyboard(chatId) {
  const replyKeyboard = {
    keyboard: [
      [{ text: "隨機數字" }, { text: "發送圖片" }], // 第一行按鈕
      [{ text: "問卷連結" }], // 第二行按鈕
      [{ text: "隱藏選單" }], // 第三行按鈕
    ],
    resize_keyboard: true, // 讓鍵盤尺寸更符合內容
    one_time_keyboard: false, // 鍵盤會一直顯示，直到被隱藏
    // selective: true // 可選，只對目標用戶顯示
  };
  await sendMessage(chatId, "請選擇一個常用操作：", replyKeyboard);
}

// **新增：隱藏回覆鍵盤**
async function hideReplyKeyboard(chatId) {
  const removeKeyboard = {
    remove_keyboard: true, // 移除當前鍵盤
    // selective: true // 可選，只對目標用戶隱藏
  };
  await sendMessage(chatId, "常用選單已隱藏。", removeKeyboard);
}

// 回覆 Callback Query，避免按鈕點擊後一直轉圈
async function answerCallbackQuery(callbackQueryId) {
  if (!TOKEN) return console.error("❌ TELEGRAM_BOT_TOKEN 未設置");

  const url = `https://api.telegram.org/bot${TOKEN}/answerCallbackQuery`;
  const payload = { callback_query_id: callbackQueryId };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok)
      console.error("❌ 無法回覆 Callback Query:", await response.text());
  } catch (error) {
    console.error("❌ 回覆 Callback Query 時發生錯誤:", error);
  }
}

async function sendMiniAppInlineButton(chatId) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: "🚀 打開 Mini App",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Open App",
            web_app: { url: "https://ajgrillcasino.vercel.app/miniapp" },
          },
        ],
      ],
    },
  };
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!resp.ok)
      console.error("❌ 無法發送 Mini App 內聯按鈕:", await resp.text());
  } catch (e) {
    console.error("❌ 發送 Mini App 內聯按鈕時發生錯誤:", e);
  }
}

async function sendReplyKeyboardWithMiniApp(chatId) {
  const replyKeyboard = {
    keyboard: [
      [
        {
          text: "Open Mini App",
          web_app: { url: "https://ajgrillcasino.vercel.app/miniapp" },
        },
      ],
      [{ text: "隱藏選單" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
  await sendMessage(chatId, "請選擇操作：", replyKeyboard);
}
