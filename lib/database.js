import { supabase } from "./supabase";

// 確認交易是否存在並檢查是否重複處理
export async function checkTransactionExists(transactionId, refId, userId) {
  const { data, error } = await supabase
    .from("transaction")
    .select("transaction_id, ref_id, user_id, settled")
    .eq("ref_id", refId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error checking transaction:", error.message || error);
    return { exists: false, settled: false };
  }

  if (data.length > 0) {
    // 如果找到一樣的 refId，檢查是否已結算
    return { exists: true, settled: data.some((tx) => tx.settled) };
  }

  return { exists: false, settled: false };
}

// 保存交易記錄
export async function saveTransaction({
  transaction_id,
  ref_id,
  user_id,
  sid,
  currency,
  amount,
  game_id,
  details,
  settled,
  transaction_type,
}) {
  const { error } = await supabase.from("transaction").insert({
    transaction_id,
    ref_id,
    user_id,
    sid,
    currency,
    amount,
    game_id,
    details,
    settled,
    transaction_type,
    created_at: new Date(),
  });

  if (error) {
    console.error("Error saving transaction:", error.message || error);
    return false;
  }

  console.log(`Transaction ${transaction_id} saved successfully.`);
  return true;
}

// 儲存或更新玩家資料
export async function upsertPlayerData({
  user_id,
  balance,
  currency = null,
  bonus = null,
  evo_initial_data = null,
}) {
  const { data, error } = await supabase.from("player").upsert({
    user_id,
    balance,
    currency,
    bonus,
    evo_initial_data,
  });

  if (error) {
    console.error("Error upserting player data:", error.message || error);
    return false;
  }

  console.log("Upserted data:", data);
  return true;
}

// 儲存或更新 SID
export async function upsertSession(sid, userId, channel) {
  const { error } = await supabase.from("session").upsert({
    sid,
    user_id: userId,
    channel,
    updated_at: new Date(),
  });

  if (error) {
    console.error("Error upserting session:", error);
    return false;
  }

  console.log(`SID ${sid} for user ${userId} upserted successfully.`);
  return true;
}

// 驗證 SID 是否存在
export async function validateSession(sid, userId) {
  const { data, error } = await supabase
    .from("session")
    .select("sid, user_id")
    .eq("sid", sid)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error validating session:", error.message || error);
    return false;
  }

  return !!data; // 如果資料存在，則驗證通過
}

// 取得玩家的 SID
export async function getSessionByUserId(userId) {
  const { data, error } = await supabase
    .from("session")
    .select("sid")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching SID:", error);
    return null;
  }

  return data ? data.sid : null;
}

// 取得玩家餘額
export async function getPlayerBalance(userId) {
  const { data, error } = await supabase
    .from("player")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching balance:", error);
    return null;
  }

  return data ? parseFloat(data.balance) : null; // 確保返回純數值類型
}

// 更新玩家餘額
export async function updatePlayerBalance(userId, newBalance) {
  const { error } = await supabase
    .from("player")
    .upsert({ user_id: userId, balance: newBalance });

  if (error) {
    console.error("Error updating balance:", error);
    return false;
  }

  console.log(`Updated balance for user ${userId} to ${newBalance}`);
  return true;
}

//查詢 ref_id 的所有交易
export async function getTransactionsByRefId(refId, userId) {
  const { data, error } = await supabase
    .from("transaction")
    .select("transaction_id, ref_id, amount, settled,transaction_type")
    .eq("ref_id", refId)
    .eq("user_id", userId);

  if (error) {
    console.error(
      "Error fetching transactions by refId:",
      error.message || error
    );
    return [];
  }

  return data;
}

// 確認 promo_transaction 是否存在並檢查是否重複處理
export async function checkPromoTransactionExists(transactionId, userId) {
  const { data, error } = await supabase
    .from("promo_transaction")
    .select("promo_id, user_id, type, amount, remaining_rounds, created_at")
    .eq("promo_id", transactionId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error checking promo transaction:", error.message || error);
    return { exists: false, settled: false };
  }

  if (data.length > 0) {
    return { exists: true, settled: true }; // promo_transaction 已存在
  }

  return { exists: false, settled: false }; // promo_transaction 不存在
}

// 保存 promo_transaction 記錄
export async function savePromoTransaction({
  promo_id,
  user_id,
  type,
  amount,
  remaining_rounds,
  game_id = null,
  jackpots = null,
}) {
  const { error } = await supabase.from("promo_transaction").insert({
    promo_id,
    user_id,
    type,
    amount,
    remaining_rounds,
    game_id,
    jackpots,
    created_at: new Date(), // 自動記錄創建時間
  });

  if (error) {
    console.error("Error saving promo transaction:", error.message || error);
    return false;
  }

  console.log(`Promo transaction ${promo_id} saved successfully.`);
  return true;
}

// getGameDetails 待開發
export async function getGameDetails(startDate, endDate) {
  try {
    // 查詢 game_history 資料表，範圍為 started_at 和 settled_at
    const { data, error } = await supabase
      .from("game_history")
      .select(
        `
          id,
          started_at,
          settled_at,
          status,
          game_type,
          table_id,
          table_name,
          dealer_uid,
          dealer_name,
          currency,
          participants,
          wager,
          payout,
          result
        `
      )
      .gte("started_at", startDate) // 起始時間篩選
      .lte("settled_at", endDate); // 結束時間篩選

    if (error) {
      console.error("Error fetching game details:", error);
      throw new Error("Failed to fetch game details from game_history");
    }

    return data;
  } catch (error) {
    console.error("Unexpected error:", error);
    throw new Error("An unexpected error occurred while fetching game details");
  }
}
