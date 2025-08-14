// 引入 Telegraf 函式庫
const { Telegraf } = require("telegraf");

// 使用你的機器人 Token 初始化 Telegraf
const TOKEN = process.env.TELEGRAM_BOT_TOKEN_GRAF;

const bot = new Telegraf(TOKEN);

// --- 處理命令 ---
// 處理 /start 命令
// 當使用者發送 /start 時，機器人會發送 "Hello, I am a Telegraf bot!"
bot.start((ctx) => ctx.reply("Hello, I am a Telegraf bot!"));

// --- 處理文字訊息 ---
// 處理所有文字訊息
// bot.on() 是一個中介軟體 (middleware)，它會捕捉指定類型的事件
// 這裡 'text' 表示捕捉所有文字訊息
bot.on("text", (ctx) => {
  const message = ctx.message.text;
  const username = ctx.message.from.username || ctx.message.from.first_name;

  // 使用 reply 方法回應訊息
  ctx.reply(`你說了: ${message}`);
  console.log(`${username} 說了: ${message}`); // 在控制台印出訊息，方便除錯
});

// --- 啟動機器人 ---
// 使用 launch() 方法啟動機器人
bot.launch();

// 監聽並優雅地停止機器人
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

console.log("Bot is running...");
