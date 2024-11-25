import { supabase } from "./supabase";

// 儲存或更新 SID
export async function upsertSession(sid, userId, channel) {
  const { error } = await supabase.from("session").upsert({
    sid,
    user_id: userId,
    channel,
    updated_at: new Date(), // 每次更新都記錄時間
  });

  if (error) {
    console.error("Error upserting session:", error);
    return false;
  }

  console.log(`SID ${sid} for user ${userId} upserted successfully.`);
  return true;
}

// 驗證 SID 是否存在
export async function validateSession(sid) {
  const { data, error } = await supabase
    .from("session")
    .select("*")
    .eq("sid", sid)
    .single();

  if (error) {
    console.error("Error validating session:", error);
    return null;
  }

  return data ? true : false;
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

export async function getPlayerBalance(userId) {
  const { data, error } = await supabase
    .from("player_balance")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching balance:", error);
    return null;
  }

  return data ? data.balance : null;
}

export async function updatePlayerBalance(userId, newBalance) {
  const { error } = await supabase
    .from("player_balance")
    .upsert({ user_id: userId, balance: newBalance });

  if (error) {
    console.error("Error updating balance:", error);
    return false;
  }

  console.log(`Updated balance for user ${userId} to ${newBalance}`);
  return true;
}
