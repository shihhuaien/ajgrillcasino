import { v4 as uuidv4 } from "uuid";
import {
  validateSession,
  getPlayerBalance,
  updatePlayerBalance,
  checkTransactionExists,
  saveTransaction,
} from "../../lib/database";

export default async function handler(req, res) {
  res.setHeader("Connection", "keep-alive");
  if (req.method !== "POST") {
    return res.status(200).json({ status: "METHOD_NOT_ALLOWED" });
  }

  try {
    const { sid, userId, currency, game, transaction, uuid } = req.body;

    // 確認必要參數是否存在
    if (!sid || !userId || !currency || !game || !transaction || !uuid) {
      return res.status(200).json({
        status: "BAD_REQUEST",
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

    // 確認交易是否已存在或已結算或是假的refId
    const { exists, settled } = await checkTransactionExists(
      transaction.id,
      transaction.refId,
      userId
    );

    if (!exists) {
      // refId 不存在，返回 BET_DOES_NOT_EXIST
      const playerBalance = await getPlayerBalance(userId);
      return res.status(200).json({
        status: "BET_DOES_NOT_EXIST",
        balance: playerBalance,
        uuid: uuidv4(),
      });
    }

    if (exists && settled) {
      const playerBalance = await getPlayerBalance(userId);
      return res.status(200).json({
        status: "BET_ALREADY_SETTLED",
        balance: playerBalance,
        uuid: uuidv4(),
      });
    }

    // 從資料庫中獲取玩家餘額
    const playerBalance = await getPlayerBalance(userId);
    if (playerBalance === null) {
      return res.status(200).json({
        status: "USER_NOT_FOUND",
        balance: null,
        uuid: uuidv4(),
      });
    }

    // 計算新餘額
    const newBalance = parseFloat(
      (playerBalance + transaction.amount).toFixed(6)
    );

    // 更新玩家餘額
    const updateResult = await updatePlayerBalance(userId, newBalance);
    if (!updateResult) {
      return res.status(200).json({
        status: "TEMPORARY_ERROR",
        balance: null,
        uuid: uuidv4(),
      });
    }

    // 記錄交易並標記為已結算
    const transactionResult = await saveTransaction({
      transaction_id: transaction.id,
      ref_id: transaction.refId || null,
      user_id: userId,
      sid,
      currency,
      amount: transaction.amount,
      game_id: game.id,
      details: game.details || null,
      settled: true, // 標記為已結算
      transaction_type: "credit",
    });

    if (!transactionResult) {
      return res.status(200).json({
        status: "TEMPORARY_ERROR",
        balance: null,
        uuid: uuidv4(),
      });
    }

    // 返回成功響應
    res.status(200).json({
      status: "OK",
      balance: newBalance,
      uuid: uuidv4(),
    });
  } catch (error) {
    console.error("Error handling CreditRequest:", error);
    res.status(200).json({
      status: "TEMPORARY_ERROR",
      balance: null,
      uuid: uuidv4(),
    });
  }
}
