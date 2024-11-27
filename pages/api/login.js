import { upsertPlayerData } from "../../lib/database";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing credentials" });
    }

    try {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";

      const authPayload = {
        uuid,
        player: {
          id: username,
          update: true,
          nickname: username,
          language: "en-GB",
          currency: "USD",
          session: {
            id: `session-${username}`,
            ip:
              req.headers["x-forwarded-for"] ||
              req.socket.remoteAddress ||
              "103.22.200.1",
          },
        },
        config: {
          brand: {
            id: "1",
            skin: "1",
          },
          game: {
            category: "roulette",
            interface: "view1",
            table: {
              id: "48z5pjps3ntvqc1b",
            },
          },
        },
      };

      const authResponse = await fetch(
        "https://diyow6.uat1.evo-test.com/ua/v1/diyow60000000001/test123",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(authPayload),
        }
      );

      if (!authResponse.ok) {
        throw new Error(`Failed to authenticate: ${authResponse.statusText}`);
      }

      const authData = await authResponse.json();

      // 模擬取得用戶的初始資料
      const userBalance = 1000; // 預設金額
      const currency = "USD";
      const bonus = 0; // 預設紅利

      // 將用戶資料儲存到資料庫
      const success = await upsertPlayerData({
        user_id: username,
        balance: userBalance,
        currency,
        bonus,
      });

      if (!success) {
        throw new Error("Failed to save player data to the database.");
      }

      return res.status(200).json({
        success: true,
        sid: authPayload.player.session.id,
        authToken: authData.entry,
      });
    } catch (error) {
      console.error("Authentication API Error:", error);
      return res
        .status(200)
        .json({ success: false, message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
