//待開發

// import { getGameDetails } from "@/lib/database"; // 假設你在 lib/database.js 中實作了資料庫查詢

// export default async function handler(req, res) {
//   if (req.method !== "GET") {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }

//   const { startDate, endDate } = req.query;

//   if (!startDate || !endDate) {
//     return res
//       .status(400)
//       .json({ message: "Missing required parameters: startDate or endDate" });
//   }

//   try {
//     const gameDetails = await getGameDetails(startDate, endDate);
//     return res.status(200).json(gameDetails);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// }
