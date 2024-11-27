import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(200)
      .json({ status: "ERROR", message: "Method Not Allowed" });
  }

  try {
    // 從請求體中提取資料
    const { sid, userId, currency, game, uuid } = req.body;

    // 驗證請求的必要屬性
    if (!sid || !userId || !currency || !uuid) {
      return res.status(200).json({
        status: "ERROR",
        message: "Missing required parameters in request",
      });
    }

    // 從 Supabase 獲取用戶餘額和獎金
    const userBalance = await getUserBalance(userId, currency);
    const userBonus = await getUserBonus(userId);

    // 如果找不到用戶，返回錯誤
    if (userBalance === null) {
      return res.status(200).json({
        status: "ERROR",
        message: "User not found or currency mismatch",
      });
    }

    // 保證餘額和獎金只保留小數點後六位
    const formattedBalance = parseFloat(userBalance.toFixed(6));
    const formattedBonus = parseFloat((userBonus || 0.0).toFixed(6));

    // 返回標準回應
    return res.status(200).json({
      status: "OK",
      balance: formattedBalance, // 返回真實餘額，保留六位小數
      bonus: formattedBonus, // 返回獎金餘額，保留六位小數
      uuid, // 回應與請求的 UUID 一致
    });
  } catch (error) {
    console.error("Error handling balance request:", error);

    return res.status(200).json({
      status: "TEMPORARY_ERROR",
      message: "Internal server error",
    });
  }
}

// 從資料庫中查詢用戶餘額
async function getUserBalance(userId, currency) {
  try {
    const { data, error } = await supabase
      .from("player")
      .select("balance, currency")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user balance:", error);
      return null;
    }

    // 確保貨幣匹配
    if (data.currency !== currency) {
      console.error("Currency mismatch");
      return null;
    }

    return parseFloat(data.balance.toFixed(6)); // 返回餘額，保留六位小數
  } catch (error) {
    console.error("Error querying user balance:", error);
    return null;
  }
}

// 從資料庫中查詢用戶獎金
async function getUserBonus(userId) {
  try {
    const { data, error } = await supabase
      .from("player")
      .select("bonus")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user bonus:", error);
      return null;
    }

    return parseFloat((data.bonus || 0.0).toFixed(6)); // 返回用戶獎金，保留六位小數
  } catch (error) {
    console.error("Error querying user bonus:", error);
    return null;
  }
}
