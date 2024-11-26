import { v4 as uuidv4 } from "uuid";
import {
  getPlayerBalance,
  updatePlayerBalance,
  checkTransactionExists,
  saveTransaction,
} from "../../lib/database";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "METHOD_NOT_ALLOWED" });
  }

  try {
    const { sid, userId, currency, game, transaction, uuid } = req.body;

    // 確認必要參數是否存在
    if (!sid || !userId || !currency || !game || !transaction || !uuid) {
      return res.status(400).json({
        status: "BAD_REQUEST",
        message: "Missing required fields",
      });
    }

    // 確認交易是否已存在
    const transactionExists = await checkTransactionExists(transaction.id);
    if (transactionExists) {
      const playerBalance = await getPlayerBalance(userId);
      return res.status(409).json({
        status: "BET_ALREADY_SETTLED",
        balance: playerBalance,
      });
    }

    // 從資料庫中獲取玩家餘額
    const playerBalance = await getPlayerBalance(userId);
    if (playerBalance === null) {
      return res.status(404).json({
        status: "USER_NOT_FOUND",
        balance: null,
      });
    }

    // 計算新餘額
    const newBalance = parseFloat(
      (playerBalance + transaction.amount).toFixed(6)
    );

    // 更新玩家餘額
    const updateResult = await updatePlayerBalance(userId, newBalance);
    if (!updateResult) {
      return res.status(500).json({
        status: "TEMPORARY_ERROR",
        balance: null,
      });
    }

    // 記錄交易
    const transactionResult = await saveTransaction({
      transaction_id: transaction.id,
      ref_id: transaction.refId || null,
      user_id: userId,
      sid,
      currency,
      amount: transaction.amount,
      type: "BET", // 根據業務邏輯設置交易類型
      game_id: game.id,
      details: game.details || null,
    });

    if (!transactionResult) {
      return res.status(500).json({
        status: "TEMPORARY_ERROR",
        balance: null,
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
    res.status(500).json({
      status: "TEMPORARY_ERROR",
      balance: null,
    });
  }
}
