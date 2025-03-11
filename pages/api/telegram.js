import fetch from "node-fetch";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN; // 在 .env.local 設定你的 Telegram Bot Token
const QUESTIONNAIRE_LINK = "https://drive.google.com/file/d/xxxxxxxxxx/view"; // 替換成你的問卷連結

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
  if (!TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN 環境變數未設置");
    return;
  }

  const message = `📄 請填寫問卷以供串接使用，完成後請回傳給我們，謝謝！\n\n${QUESTIONNAIRE_LINK}`;

  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: "Markdown",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("❌ 無法發送訊息:", await response.text());
    } else {
      console.log("✅ 問卷訊息已發送");
    }
  } catch (error) {
    console.error("❌ 發送訊息時發生錯誤:", error);
  }
}
