import { supabase } from "../lib/supabase.js";

async function fetchTestData() {
  const { data, error } = await supabase
    .from("player")
    .select("*")
    .eq("user_id", "test_user2");

  if (error) {
    console.error("Fetch failed:", error.message);
  } else {
    console.log("Fetched data:", data);
  }
}

fetchTestData();
