import { v4 as uuidv4 } from "uuid";
import { getPlayerBalance, updatePlayerBalance } from "../../lib/database";

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

    // 從資料庫中獲取玩家餘額
    const playerBalance = await getPlayerBalance(userId);
    if (playerBalance === null) {
      return res.status(404).json({
        status: "USER_NOT_FOUND",
        balance: null,
      });
    }

    // 處理交易 (例如加/扣金額)
    const newBalance = playerBalance + transaction.amount;

    // 更新玩家餘額
    const updateResult = await updatePlayerBalance(userId, newBalance);
    if (!updateResult) {
      return res.status(500).json({
        status: "TEMPORARY_ERROR",
        balance: null,
      });
    }

    // 返回成功響應
    res.status(200).json({
      status: "OK",
      balance: newBalance.toFixed(6), // 返回截取到小數點後6位的餘額
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
