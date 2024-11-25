import { supabase } from "../lib/supabase.js";

async function insertTestData() {
  const { data, error } = await supabase
    .from("player_balance")
    .insert([{ user_id: "test_user", balance: 100.0 }]);

  if (error) {
    console.error("Insert failed:", error.message);
  } else {
    console.log("Insert success:", data);
  }
}

insertTestData();
