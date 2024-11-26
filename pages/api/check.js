import { validateSession } from "../../lib/database";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { sid, userId, channel, uuid } = req.body;

    // 驗證請求參數是否完整
    if (!sid || !userId || !channel?.type || !uuid) {
      return res.status(400).json({
        status: "ERROR",
        message: "Missing required parameters",
      });
    }

    // 模擬用戶和會話驗證（改為真實邏輯）
    const isValidSession = await validateSession(sid, userId);
    if (!isValidSession) {
      return res.status(401).json({
        status: "ERROR",
        message: "Invalid session or user",
      });
    }

    // 返回成功
    return res.status(200).json({
      status: "OK",
      uuid,
    });
  } else {
    // 僅接受 POST 請求
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
