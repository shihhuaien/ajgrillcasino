import { upsertPlayerData, upsertSession } from "../../lib/database";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, password, image, source } = req.body;

    if (!username || !password || !image || !source) {
      return res
        .status(400)
        .json({ success: false, message: "Missing credentials" });
    }

    try {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const newSid = `session-${username}`;
      const userId = username;
      const channel = { type: "P" };

      // 儲存或更新 SID 到資料庫
      const successGetSid = await upsertSession(newSid, userId, channel);

      if (!successGetSid) {
        return res
          .status(200)
          .json({ status: "ERROR", message: "Failed to upsert SID" });
      }

      const authPayload = {
        uuid,
        player: {
          id: username,
          update: true,
          nickname: username,
          language: "zh-Hant",
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
            skin: "2",
          },
          game: {
            category: image.gameTypeCode,
            interface: "view1",
            // table: {
            //   id: image.table_id,
            // },
          },
          urls: {
            lobby: "https://ajgrillcasino.vercel.app/lobby", // 設定返回頁面 URL
            rngCloseButton: "https://ajgrillcasino.vercel.app/lobby", // 設定返回頁面 URL
            rngLobbyButton: "https://ajgrillcasino.vercel.app/lobby", // 設定返回頁面 URL
          },
        },
      };

      // 根據 source 決定 fetch 的 URL
      let url;
      if (source === "ow") {
        url = "https://diyow6.uat1.evo-test.com/ua/v1/diyow60000000001/test123";
      } else if (source === "subow") {
        url =
          "https://diyasmaster.uat1.evo-test.com/ua/v1/subas11ow0000001/test123";
        console.log(url);
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid source" });
      }

      const authResponse = await fetch(url, {
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
        evo_initial_data: authPayload,
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
