import { supabase } from "../lib/supabase.js";

async function updateTestData() {
  const { data, error } = await supabase
    .from("player")
    .update({ balance: 1000.0 })
    .eq("user_id", "test_user");

  if (error) {
    console.error("Update failed:", error.message);
  } else {
    console.log("Update success:", data);
  }
}

updateTestData();
