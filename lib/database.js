import Database from "better-sqlite3";

// 初始化資料庫連線
const db = new Database("./database.sqlite", { verbose: console.log });

// 確保資料表存在
db.exec(`
  CREATE TABLE IF NOT EXISTS player_balance (
    user_id TEXT PRIMARY KEY,
    balance REAL NOT NULL
  )
`);

// 插入測試資料（如果需要）
db.exec(`
  INSERT OR IGNORE INTO player_balance (user_id, balance)
  VALUES 
    ('user1', 1000.0),
    ('user2', 500.5)
`);

export async function getPlayerBalance(userId) {
  // 查詢玩家餘額
  const stmt = db.prepare(
    "SELECT balance FROM player_balance WHERE user_id = ?"
  );
  const row = stmt.get(userId);
  return row ? row.balance : null;
}

export async function updatePlayerBalance(userId, newBalance) {
  // 更新玩家餘額
  const stmt = db.prepare(`
    INSERT INTO player_balance (user_id, balance) 
    VALUES (?, ?)
    ON CONFLICT(user_id) DO UPDATE SET balance = excluded.balance
  `);
  stmt.run(userId, newBalance);
  console.log(`Updated balance for user ${userId} to ${newBalance}`);
  return true;
}
