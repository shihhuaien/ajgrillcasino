import { upsertSession, validateSession } from "../../lib/database";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { sid, userId, channel, uuid } = req.body;

    // 驗證必要參數
    if (!userId || !uuid || !channel?.type) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "Missing required fields" });
    }

    // 如果沒有 SID，則生成新的 SID
    const newSid = sid || `session-${userId}`;

    // 儲存或更新 SID 到資料庫
    const success = await upsertSession(newSid, userId, channel);

    if (!success) {
      return res
        .status(500)
        .json({ status: "ERROR", message: "Failed to upsert SID" });
    }

    return res.status(200).json({
      status: "OK",
      sid: newSid,
      uuid,
    });
  } else if (req.method === "GET") {
    const { sid } = req.query;

    // 驗證 SID 是否存在
    const isValid = await validateSession(sid);

    if (!isValid) {
      return res
        .status(404)
        .json({ status: "ERROR", message: "SID not found" });
    }

    return res.status(200).json({ status: "OK", message: "SID is valid" });
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).json({
      status: "ERROR",
      message: `Method ${req.method} Not Allowed`,
    });
  }
}
