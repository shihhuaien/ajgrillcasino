import { validateSession } from "../../lib/database";

export default async function handler(req, res) {
  // 確保所有回應都包含 Connection: keep-alive 標頭
  res.setHeader("Connection", "keep-alive");

  if (req.method === "POST") {
    const { sid, userId, channel, uuid } = req.body;

    // 驗證請求參數是否完整
    if (!sid || !userId || !channel?.type || !uuid) {
      return res.status(200).json({
        status: "ERROR",
        message: "Missing required parameters",
      });
    }

    // 驗證有沒有user跟sid
    const isValidSession = await validateSession(sid, userId);
    if (!isValidSession) {
      return res.status(200).json({
        status: "INVALID_PARAMETER",
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
    return res.status(200).end(`Method ${req.method} Not Allowed`);
  }
}
