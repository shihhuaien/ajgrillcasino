import { supabase } from "../lib/supabase.js";

async function deleteTestData() {
  const { data, error } = await supabase
    .from("player_balance")
    .delete()
    .eq("user_id", "test_user");

  if (error) {
    console.error("Delete failed:", error.message);
  } else {
    console.log("Delete success:", data);
  }
}

deleteTestData();
