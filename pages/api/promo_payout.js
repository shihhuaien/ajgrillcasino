import { getPlayerBalance, updatePlayerBalance } from "../../lib/database";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "ERROR", message: "Method not allowed" });
  }

  const { sid, userId, currency, game, promoTransaction, uuid } = req.body;

  if (!sid || !userId || !currency || !promoTransaction || !uuid) {
    return res
      .status(400)
      .json({ status: "ERROR", message: "Missing required parameters" });
  }

  try {
    // 獲取玩家餘額
    const currentBalance = await getPlayerBalance(userId);
    if (currentBalance === null) {
      return res
        .status(404)
        .json({ status: "ERROR", message: "User not found", uuid });
    }

    // 計算新的餘額
    const newBalance =
      parseFloat(currentBalance) + parseFloat(promoTransaction.amount);

    // 更新玩家餘額
    const updateSuccess = await updatePlayerBalance(userId, newBalance);
    if (!updateSuccess) {
      return res.status(500).json({
        status: "TEMPORARY_ERROR",
        message: "Failed to update balance",
        uuid,
      });
    }

    // 返回成功
    return res.status(200).json({
      status: "OK",
      balance: parseFloat(newBalance.toFixed(2)), // 保留2位小數
      bonus: null, // 根據需要設定 bonus
      uuid,
    });
  } catch (error) {
    console.error("Error handling PromoPayoutRequest:", error);
    return res.status(500).json({
      status: "TEMPORARY_ERROR",
      message: "Internal server error",
      uuid,
    });
  }
}
