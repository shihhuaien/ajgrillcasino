import crypto from "crypto";

/**
 * WebApp initData 驗證：
 * - 依照 Telegram 官方演算法檢查 hash
 * - 檢查 auth_date 不超過 5 分鐘（可調）
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ valid: false, error: "Method Not Allowed" });
  }

  const { initData } = req.body || {};
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!BOT_TOKEN) {
    return res
      .status(500)
      .json({ valid: false, error: "Missing TELEGRAM_BOT_TOKEN" });
  }
  if (!initData || typeof initData !== "string") {
    return res.status(400).json({ valid: false, error: "Missing initData" });
  }

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash)
      return res.status(400).json({ valid: false, error: "Missing hash" });

    // 檢查有效期（預設 5 分鐘）
    const authDate = Number(params.get("auth_date") || 0);
    const nowSec = Math.floor(Date.now() / 1000);
    const MAX_AGE_SEC = 300;
    if (!authDate || nowSec - authDate > MAX_AGE_SEC) {
      return res.status(401).json({ valid: false, error: "Expired auth_date" });
    }

    // 準備 data_check_string
    params.delete("hash");
    const data = [];
    for (const [key, value] of params.entries()) {
      data.push(`${key}=${value}`);
    }
    data.sort();
    const dataCheckString = data.join("\n");

    // secret_key = HMAC_SHA256("WebAppData", BOT_TOKEN)
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(BOT_TOKEN)
      .digest();

    // 計算 HMAC_SHA256(data_check_string, secret_key)
    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    const valid = hmac === hash;

    return res.status(valid ? 200 : 401).json({
      valid,
      user: valid ? JSON.parse(params.get("user") || "null") : null,
    });
  } catch (err) {
    console.error("[tg-verify] error", err);
    return res.status(500).json({ valid: false, error: "Internal error" });
  }
}
