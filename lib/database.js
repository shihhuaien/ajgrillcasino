import { supabase } from "./supabase";

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
