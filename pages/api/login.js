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

      // 建構 payload
      const authPayload = {
        uuid,
        player: {
          id: username, // 使用者名稱作為玩家 ID
          update: true,
          nickname: username,
          language: "en-GB",
          currency: "EUR",
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
            category: "roulette", // 遊戲類型
            interface: "view1", // 遊戲介面
            table: {
              id: "48z5pjps3ntvqc1b", // 符合 Postman 測試的遊戲桌 ID
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
      return res.status(200).json({
        success: true,
        sid: authPayload.player.session.id,
        authToken: authData.entry,
      });
    } catch (error) {
      console.error("Authentication API Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
