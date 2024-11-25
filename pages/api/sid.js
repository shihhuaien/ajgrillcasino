import { v4 as uuidv4 } from "uuid"; // 用於生成唯一的 UUID

// 模擬的資料庫儲存 SID 記錄
const sidDatabase = new Map();

export default function handler(req, res) {
  if (req.method === "POST") {
    const { sid, userId, channel, uuid } = req.body;

    // 驗證必要參數
    if (!userId || !uuid || !channel?.type) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "Missing required fields" });
    }

    // 如果沒有提供 SID，則生成新的 SID
    const newSid = sid || `sid-${uuidv4()}`;

    // 儲存 SID 和相關資訊到模擬的資料庫中
    sidDatabase.set(newSid, {
      userId,
      channel,
      uuid,
      createdAt: new Date(),
    });

    // 回傳成功結果
    return res.status(200).json({
      status: "OK",
      sid: newSid,
      uuid,
    });
  } else if (req.method === "GET") {
    const { sid } = req.query;

    // 驗證 SID 是否存在於資料庫中
    if (sid && sidDatabase.has(sid)) {
      return res.status(200).json({
        status: "OK",
        message: "SID is valid",
      });
    }

    return res.status(404).json({
      status: "ERROR",
      message: "SID not found",
    });
  } else {
    // 其他方法不支援
    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).json({
      status: "ERROR",
      message: `Method ${req.method} Not Allowed`,
    });
  }
}
