import {
  validateSession,
  getPlayerBalance,
  updatePlayerBalance,
  checkTransactionExists,
  saveTransaction,
} from "../../lib/database";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(200)
      .json({ status: "ERROR", message: "Method not allowed" });
  }

  const { sid, userId, currency, game, promoTransaction, uuid } = req.body;

  if (!sid || !userId || !currency || !promoTransaction || !uuid) {
    return res
      .status(200)
      .json({ status: "ERROR", message: "Missing required parameters" });
  }

  const isValidSession = await validateSession(sid, userId);
  if (!isValidSession) {
    return res.status(200).json({
      status: "INVALID_PARAMETER",
      message: "Invalid session or user",
    });
  }

  try {
    // 獲取玩家餘額
    const currentBalance = await getPlayerBalance(userId);
    if (currentBalance === null) {
      return res
        .status(404)
        .json({ status: "ERROR", message: "User not found", uuid });
    }

    // 驗證交易是否已存在
    const { exists, settled } = await checkTransactionExists(
      transaction.id,
      transaction.refId,
      userId
    );
    if (exists) {
      return res.status(200).json({
        status: "BET_ALREADY_SETTLED",
        message: "Duplicate transaction.id detected",
        balance: parseFloat(currentBalance.toFixed(6)),
        uuid,
      });
    }

    if (currentBalance === null) {
      return res.status(200).json({ status: "PLAYER_NOT_FOUND" });
    }

    // 計算新的餘額
    const newBalance =
      parseFloat(currentBalance) + parseFloat(promoTransaction.amount);

    // 更新玩家餘額
    const updateSuccess = await updatePlayerBalance(userId, newBalance);
    if (!updateSuccess) {
      return res.status(200).json({
        status: "TEMPORARY_ERROR",
        message: "Failed to update balance",
        uuid,
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
      settled: false,
      transaction_type: "promo_payout",
    });
    if (!transactionResult) {
      return res.status(200).json({
        status: "TEMPORARY_ERROR",
        balance: null,
        uuid: uuidv4(),
      });
    }

    // 返回成功
    return res.status(200).json({
      status: "OK",
      balance: parseFloat(newBalance.toFixed(6)), // 保留6位小數
      bonus: null, // 根據需要設定 bonus
      uuid,
    });
  } catch (error) {
    console.error("Error handling PromoPayoutRequest:", error);
    return res.status(200).json({
      status: "TEMPORARY_ERROR",
      message: "Internal server error",
      uuid,
    });
  }
}
