import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN; // 在 .env.local 設定你的 Telegram Bot Token
const QUESTIONNAIRE_LINK = "https://drive.google.com/file/d/xxxxxxxxxx/view"; // 替換成你的問卷連結

export default async function handler(
  req = NextApiRequest,
  res = NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  const body = req.body;
  console.log("📩 收到 Telegram 訊息:", body);

  if (!body.message) {
    return res.status(200).json({ status: "No message found" });
  }

  const chatId = body.message.chat.id;
  const messageText = body.message.text;

  // 確保機器人可以讀取群組訊息
  const isGroup =
    body.message.chat.type === "group" ||
    body.message.chat.type === "supergroup";

  // 如果使用者在群組內輸入 "/questionnaire"
  if (messageText === "/questionnaire" && isGroup) {
    await sendQuestionnaire(chatId);
  }

  res.status(200).json({ status: "Message processed" });
}

// 發送問卷連結
async function sendQuestionnaire(chatId) {
  const message = `📄 請填寫問卷以供串接使用，完成後請回傳給我們，謝謝！\n\n${QUESTIONNAIRE_LINK}`;

  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: "Markdown",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error("❌ 無法發送訊息:", await response.text());
  }
}


export default async function handler(req, res) {
    console.log("🔍 收到請求:", req.body); // 這行幫助 debug
  
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST requests are allowed" });
    }
  
    const body = req.body;
    if (!body.message) {
      return res.status(200).json({ status: "No message found" });
    }
  
    console.log("📩 收到 Telegram 訊息:", body.message.text);
  }