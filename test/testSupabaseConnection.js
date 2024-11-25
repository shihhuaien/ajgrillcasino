import "dotenv/config"; // 確保環境變數正確加載
import { supabase } from "../lib/supabase.js";

async function testConnection() {
  try {
    const { data, error } = await supabase.from("player_balance").select("*");

    if (error) {
      console.error("Connection failed:", error.message);
      return;
    }

    console.log("Connected successfully! Data:", data);
  } catch (err) {
    console.error("Unexpected error occurred:", err.message);
  }
}

testConnection();
