export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "方法不允許" });
  }

  try {
    const API_HOST = process.env.API_HOST;
    const AUTH_TOKEN = process.env.AUTH_TOKEN;
    const CASINO_ID = process.env.CASINO_ID;

    if (!API_HOST || !AUTH_TOKEN || !CASINO_ID) {
      throw new Error("缺少必要的環境變數");
    }

    const credentials = Buffer.from(`${CASINO_ID}:${AUTH_TOKEN}`).toString(
      "base64"
    );
    const url = `https://${API_HOST}/api/lobby/v1/${CASINO_ID}/state?gameProvider=evolution`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API 請求失敗，狀態碼: ${response.status}`);
    }

    const data = await response.json();
    console.log("Evolution API 回應:", JSON.stringify(data, null, 2));

    const formattedTables = Object.values(data.tables || {})
      .filter((table) => {
        const thumbnailUrl = table.videoSnapshot?.thumbnails?.L;
        return thumbnailUrl && thumbnailUrl.trim() !== ""; // 確保 URL 存在且非空
      })
      .map((table) => ({
        id: table.virtualTableId || table.tableId,
        src: table.videoSnapshot.thumbnails.L,
        alt: table.name || "Casino Table",
        table_id: table.tableId, // 明確映射 tableId 作為 table_id
        table_name: table.name, // 保留桌子名稱
        gameProvider: "Evolution", // 硬編碼，因為 API 是針對 Evolution
        subprovider: "", // 根據需求填入，若無則留空
        gameVertical: "Live", // 假設為 Live，根據實際需求調整
        gameTypeName: table.gameTypeUnified, // 使用 gameTypeUnified 作為名稱
        gameTypeCode: table.gameTypeUnified, // 使用 gameTypeUnified 作為代碼
        open: table.open,
      }));

    res.status(200).json({ tables: formattedTables });
  } catch (error) {
    console.error("從 Evolution API 獲取桌子資料失敗:", error);
    res.status(500).json({ error: "無法獲取桌子圖片" });
  }
}
