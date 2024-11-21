import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req = NextApiRequest, res = NextApiResponse) {
  if (req.method === "POST") {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Missing credentials" });
    }

    try {
      // 模擬生成的 UUID 作為請求 ID
      const uuid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // API 請求的 payload
      const authPayload = {
        uuid,
        player: {
          id: username, // 使用者名稱作為玩家 ID
          update: true,
          nickname: username,
          language: "en-GB",
          currency: "EUR",
          session: {
            id: `session-${uuid}`,
            ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
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
              id: "vip-roulette-123",
            },
            },
            "urls": {
        "cashier": "https://www.timothee.shop/cashier",
        "responsibleGaming": "https://www.timothee.shop/responsible-gaming",
        "lobby": "https://www.timothee.shop/lobby",
        "sessionTimeout": "https://www.timothee.shop/session-timeout"
      },
        },
      };

      // 發送到 User Authentication API 2.0 的請求
      const authResponse = await fetch("https://diyow6.uat1.evo-test.com/ua/v1/diyow60000000001/test123", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authPayload),
      });

      if (!authResponse.ok) {
        throw new Error(`Failed to authenticate: ${authResponse.statusText}`);
      }

      const authData = await authResponse.json();

      // 返回成功
      return res.status(200).json({
        success: true,
        sid: authPayload.player.session.id,
        authToken: authData.entry, // 假设 Evolution 返回的 `entry` 作為 Token
      });
    } catch (error) {
      console.error("Authentication API Error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
