import fetch from "node-fetch";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const QUESTIONNAIRE_LINK =
  "https://docs.google.com/spreadsheets/d/1RCPZDEmz1xotlvCyAqg1sz5JKtg-PorwboY4NqRKbD8/edit?gid=243266798#gid=243266798";

// 新增函數：設定命令選單及主選單按鈕
async function setBotCommandsAndMenuButton() {
  if (!TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN 未設置");
    return;
  }

  // --- 設定命令選單 ---
  const setCommandsUrl = `https://api.telegram.org/bot${TOKEN}/setMyCommands`;
  const commands = [
    { command: "start", description: "開始使用" },
    { command: "help", description: "查看指令列表" },
    { command: "echo", description: "回覆相同訊息" },
    { command: "random", description: "隨機數字" },
    { command: "photo", description: "發送圖片" },
    { command: "buttons", description: "顯示按鈕" },
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

  // --- 設定主選單按鈕 (MenuButton) ---
  // 這裡我們將選單按鈕設定為顯示命令列表 (type: 'commands')
  const setMenuButtonUrl = `https://api.telegram.org/bot${TOKEN}/setChatMenuButton`;
  const menuButtonPayload = {
    // 如果不指定 chat_id，將設定為機器人在所有私聊中的預設選單按鈕
    menu_button: {
      type: "commands", // 設定為顯示命令列表
    },
  };

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

  console.log("🔍 收到請求:", req.body);
  const body = req.body;

  // 在收到第一個請求時設定命令選單及主選單按鈕（僅執行一次）
  if (body.message && !global.commandsAndMenuButtonSet) {
    await setBotCommandsAndMenuButton(); // 調用新的函數
    global.commandsAndMenuButtonSet = true; // 避免重複設定
  }

  if (!body.message) {
    return res.status(200).json({ status: "No message found" });
  }

  const chatId = body.message.chat.id;
  const messageText = body.message.text;

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
        "/start - 開始使用\n" +
        "/help - 查看指令列表\n" +
        "/echo <message> - 回覆相同訊息\n" +
        "/random - 隨機數字\n" +
        "/photo - 發送圖片\n" +
        "/buttons - 顯示按鈕\n" +
        "/questionnaire - 發送問卷連結（僅限群組）"
    );
  } else if (messageText.startsWith("/echo ")) {
    const reply = messageText.replace("/echo ", "");
    await sendMessage(chatId, `🔁 你說: ${reply}`);
  } else if (messageText === "/random") {
    const randomNum = Math.floor(Math.random() * 100) + 1;
    await sendMessage(chatId, `🎲 你的隨機數字是: ${randomNum}`);
  } else if (messageText === "/photo") {
    await sendPhoto(chatId);
  } else if (messageText === "/buttons") {
    await sendButtons(chatId);
  } else if (messageText === "/questionnaire" && isGroup) {
    await sendQuestionnaire(chatId);
  }

  res.status(200).json({ status: "Message processed" });
}

// 發送一般文字訊息
async function sendMessage(chatId, text) {
  if (!TOKEN) return console.error("❌ TELEGRAM_BOT_TOKEN 未設置");

  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const payload = { chat_id: chatId, text, parse_mode: "Markdown" };

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

// 發送按鈕
async function sendButtons(chatId) {
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
    if (!response.ok) console.error("❌ 無法發送按鈕:", await response.text());
    // 處理 callback_data 的邏輯應該在 handler 中根據 update.callback_query 處理
  } catch (error) {
    console.error("❌ 發送按鈕時發生錯誤:", error);
  }
}
