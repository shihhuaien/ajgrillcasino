import { supabase } from "../lib/supabase.js";

async function insertTestData() {
  const { data, error } = await supabase
    .from("player_balance")
    .insert([
      { user_id: "test_user30", balance: 30.0, currency: "USD", bonus: 0.0 },
    ]);

  if (error) {
    console.error("Insert failed:", error.message);
  } else {
    console.log("Insert success:", data);
  }
}

insertTestData();
