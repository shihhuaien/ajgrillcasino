import fetch from "node-fetch";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const QUESTIONNAIRE_LINK =
  "https://docs.google.com/spreadsheets/d/1RCPZDEmz1xotlvCyAqg1sz5JKtg-PorwboY4NqRKbD8/edit?gid=243266798#gid=243266798";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  console.log("🔍 收到請求:", req.body);
  const body = req.body;

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
        "/start - 開始使用機器人\n" +
        "/help - 查看指令列表\n" +
        "/echo <message> - 回覆相同訊息\n" +
        "/random - 隨機數字\n" +
        "/photo - 發送圖片\n" +
        "/buttons - 顯示按鈕"
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
    photo: "https://source.unsplash.com/random/600x400", // 使用 Unsplash 隨機圖片
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
  } catch (error) {
    console.error("❌ 發送按鈕時發生錯誤:", error);
  }
}
