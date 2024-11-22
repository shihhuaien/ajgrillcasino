import { v4 as uuidv4 } from "uuid"; // 用來生成唯一的 uuid
import { getPlayerBalance, updatePlayerBalance } from "../../lib/database"; // 假設你有這些資料庫操作方法
import Cors from "cors";

// 初始化 CORS
const cors = Cors({
  methods: ["POST"], // 僅允許 POST 方法
  origin: "*", // 允許所有域名（可以根據需求限制）
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method !== "POST") {
    return res.status(405).json({ status: "METHOD_NOT_ALLOWED" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ status: "METHOD_NOT_ALLOWED" });
  }

  try {
    const { sid, userId, currency, game, transaction, uuid } = req.body;

    // 驗證請求參數
    if (!sid || !userId || !currency || !game || !transaction || !uuid) {
      return res.status(400).json({
        status: "INVALID_REQUEST",
        message: "Missing required fields",
      });
    }

    // 從資料庫獲取玩家餘額
    const playerBalance = await getPlayerBalance(userId);

    if (playerBalance === null) {
      return res.status(404).json({ status: "PLAYER_NOT_FOUND" });
    }

    // 驗證餘額是否足夠
    if (playerBalance < transaction.amount) {
      return res.status(200).json({
        status: "INSUFFICIENT_FUNDS",
        balance: playerBalance,
        uuid,
      });
    }

    // 更新玩家餘額（扣除下注金額）
    const newBalance = playerBalance - transaction.amount;
    const updateResult = await updatePlayerBalance(userId, newBalance);

    if (!updateResult) {
      return res.status(500).json({ status: "TEMPORARY_ERROR" });
    }

    // 回應成功訊息
    return res.status(200).json({
      status: "OK",
      balance: newBalance,
      bonus: 0, // 假設無額外的 bonus，根據需求修改
      uuid,
    });
  } catch (error) {
    console.error("Error handling DebitRequest:", error);
    return res.status(500).json({ status: "TEMPORARY_ERROR" });
  }
}
