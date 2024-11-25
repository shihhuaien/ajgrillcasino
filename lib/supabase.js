import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// 獲取 Supabase 的 URL 和 API 密鑰
const SUPABASE_URL = process.env.SUPABASE_URL;
//const SUPABASE_URL = "https://jvclkksoazvkalimilvq.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY;
//const SUPABASE_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Y2xra3NvYXp2a2FsaW1pbHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0OTkyMDksImV4cCI6MjA0ODA3NTIwOX0.K0OvhYRxEzqeggNSxqQ6eMdy7UnOYk0c8HkUBPCBAt8";

// 初始化 Supabase 客戶端
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
