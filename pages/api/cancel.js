import { getPlayerBalance, updatePlayerBalance } from "@/lib/database";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 解析請求內容
    const { transaction, sid, userId, uuid, currency, game } = req.body;

    if (!transaction || !sid || !userId || !uuid || !currency || !game) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "Missing parameters" });
    }

    const { id, refId, amount } = transaction;

    // 獲取用戶餘額
    const playerBalance = await getPlayerBalance(userId);
    if (playerBalance === null) {
      return res
        .status(404)
        .json({ status: "ERROR", message: "User not found" });
    }

    // 模擬取消交易邏輯
    // 根據 refId 檢查取消條件是否符合（這裡假設一定會取消成功）
    const newBalance = playerBalance + amount;

    // 更新用戶餘額
    const updateSuccess = await updatePlayerBalance(userId, newBalance);
    if (!updateSuccess) {
      return res
        .status(500)
        .json({ status: "TEMPORARY_ERROR", message: "Balance update failed" });
    }

    // 構建回應
    const response = {
      status: "OK",
      balance: newBalance.toFixed(6), // 餘額保留兩位小數
      bonus: 0.0, // 假設無額外 bonus
      uuid, // 回傳請求中的 uuid
    };

    // 回應客戶端
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error handling CancelRequest:", error);
    return res
      .status(500)
      .json({ status: "TEMPORARY_ERROR", message: "Internal server error" });
  }
}
