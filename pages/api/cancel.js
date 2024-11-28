import {
  validateSession,
  getPlayerBalance,
  updatePlayerBalance,
  checkTransactionExists,
  getTransactionsByRefId,
  saveTransaction,
} from "../../lib/database";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 解析請求內容
    const { transaction, sid, userId, uuid, currency, game } = req.body;

    if (!transaction || !sid || !userId || !uuid || !currency || !game) {
      return res
        .status(200)
        .json({ status: "ERROR", message: "Missing parameters" });
    }

    const isValidSession = await validateSession(sid, userId);
    if (!isValidSession) {
      return res.status(200).json({
        status: "INVALID_PARAMETER",
        message: "Invalid session or user",
      });
    }

    const { refId } = transaction;

    // 查詢所有與 refId 匹配的交易
    const transactionList = await getTransactionsByRefId(refId, userId);

    // 如果沒有匹配的交易
    if (transactionList.length === 0) {
      const playerBalance = await getPlayerBalance(userId);
      return res.status(200).json({
        status: "BET_DOES_NOT_EXIST",
        balance: playerBalance ? playerBalance.toFixed(6) : null,
        uuid,
      });
    }

    // 確認是否有任何交易已結算
    const hasSettled = transactionList.some((tx) => tx.settled);
    if (hasSettled) {
      const playerBalance = await getPlayerBalance(userId);
      return res.status(200).json({
        status: "BET_ALREADY_SETTLED",
        balance: playerBalance ? playerBalance.toFixed(6) : null,
        uuid,
      });
    }

    // 計算所有未結算交易的總金額
    const totalAmount = transactionList.reduce((sum, tx) => sum + tx.amount, 0);

    // 獲取用戶餘額
    const playerBalance = await getPlayerBalance(userId);
    if (playerBalance === null) {
      return res
        .status(200)
        .json({ status: "ERROR", message: "User not found" });
    }

    //如果要自己計算要返回給player的總數
    //const newBalance = playerBalance + totalAmount;

    //直接用request的amount來返還
    const { amount } = transaction; // 從請求中提取 amount
    const newBalance = playerBalance + amount;

    // 更新用戶餘額
    const updateSuccess = await updatePlayerBalance(userId, newBalance);
    if (!updateSuccess) {
      return res
        .status(200)
        .json({ status: "TEMPORARY_ERROR", message: "Balance update failed" });
    }

    // 保存取消交易記錄
    const saveSuccess = await saveTransaction({
      transaction_id: transaction.id, // 只需要保存一次取消記錄
      ref_id: refId,
      user_id: userId,
      sid,
      currency,
      amount: totalAmount,
      game_id: game,
      details: game.details || null,
      settled: true,
      transaction_type: "cancel",
    });

    if (!saveSuccess) {
      return res.status(200).json({
        status: "TEMPORARY_ERROR",
        message: "Transaction save failed",
      });
    }

    // 構建回應
    const response = {
      status: "OK",
      balance: newBalance.toFixed(6),
      bonus: 0.0, // 假設無額外 bonus
      uuid, // 回傳請求中的 uuid
    };

    // 回應客戶端
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error handling CancelRequest:", error);
    return res
      .status(200)
      .json({ status: "TEMPORARY_ERROR", message: "Internal server error" });
  }
}
