import { v4 as uuidv4 } from "uuid";
import {
  validateSession,
  getPlayerBalance,
  updatePlayerBalance,
  saveTransaction,
  checkTransactionExists,
} from "../../lib/database";

import Cors from "cors";

// 初始化 CORS
const cors = Cors({
  methods: ["POST"],
  origin: "*",
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
  res.setHeader("Connection", "keep-alive");

  await runMiddleware(req, res, cors);

  if (req.method !== "POST") {
    return res.status(200).json({ status: "METHOD_NOT_ALLOWED" });
  }

  try {
    const { sid, userId, currency, game, transaction, uuid } = req.body;

    // 驗證請求參數
    if (!sid || !userId || !currency || !game || !transaction || !uuid) {
      return res.status(200).json({
        status: "INVALID_REQUEST",
        message: "Missing required fields",
      });
    }

    const isValidSession = await validateSession(sid, userId);
    if (!isValidSession) {
      return res.status(200).json({
        status: "INVALID_PARAMETER",
        message: "Invalid session or user",
      });
    }

    // 從資料庫獲取玩家餘額
    const playerBalance = await getPlayerBalance(userId);
    if (playerBalance === null) {
      return res.status(200).json({ status: "PLAYER_NOT_FOUND" });
    }

    // 驗證交易是否已存在
    const { exists, settled } = await checkTransactionExists(
      transaction.id,
      transaction.refId,
      userId
    );
    if (exists) {
      return res.status(200).json({
        status: "BET_ALREADY_EXIST",
        message: "Duplicate bet detected",
        balance: parseFloat(playerBalance.toFixed(6)),
        uuid,
      });
    }

    if (playerBalance === null) {
      return res.status(200).json({ status: "PLAYER_NOT_FOUND" });
    }

    // 驗證餘額是否足夠
    if (playerBalance < transaction.amount) {
      return res.status(200).json({
        status: "INSUFFICIENT_FUNDS",
        balance: parseFloat(playerBalance.toFixed(6)),
        uuid,
      });
    }

    // 更新玩家餘額（扣除下注金額）
    const newBalance = parseFloat(
      (playerBalance - transaction.amount).toFixed(6)
    );
    console.log(playerBalance);
    console.log(transaction);
    const updateResult = await updatePlayerBalance(userId, newBalance);

    if (!updateResult) {
      return res.status(200).json({ status: "TEMPORARY_ERROR" });
    }

    // 存交易紀錄
    const transactionSaved = await saveTransaction({
      transaction_id: transaction.id,
      ref_id: transaction.refId || null,
      user_id: userId,
      sid,
      currency,
      amount: transaction.amount,
      game_id: game.id,
      details: game.details || null,
      settled: false,
      transaction_type: "debit",
    });

    if (!transactionSaved) {
      return res.status(200).json({
        status: "TEMPORARY_ERROR",
        message: "Failed to save transaction",
      });
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
    return res.status(200).json({ status: "TEMPORARY_ERROR" });
  }
}
