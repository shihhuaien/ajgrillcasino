import {
  validateSession,
  getPlayerBalance,
  updatePlayerBalance,
  checkTransactionExists,
  saveTransaction,
} from "@/lib/database";

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

    const { id, refId, amount } = transaction;

    // 檢查交易是否已存在並是否已結算
    const transactionCheck = await checkTransactionExists(id, refId, userId);

    // 如果交易不存在
    if (!transactionCheck.exists) {
      const playerBalance = await getPlayerBalance(userId);
      return res.status(200).json({
        status: "BET_DOES_NOT_EXIST",
        balance: playerBalance ? playerBalance.toFixed(6) : null,
        uuid,
      });
    }

    // 如果交易已結算
    if (transactionCheck.settled) {
      const playerBalance = await getPlayerBalance(userId);
      return res.status(200).json({
        status: "BET_ALREADY_SETTLED",
        balance: playerBalance ? playerBalance.toFixed(6) : null,
        uuid,
      });
    }

    // 獲取用戶餘額
    const playerBalance = await getPlayerBalance(userId);
    if (playerBalance === null) {
      return res
        .status(200)
        .json({ status: "ERROR", message: "User not found" });
    }

    // 模擬取消交易邏輯
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
      transaction_id: id,
      ref_id: refId,
      user_id: userId,
      sid,
      currency,
      amount,
      game_id: game,
      details: game.details || null,
      settled: true,
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
