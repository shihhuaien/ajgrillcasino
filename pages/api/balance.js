// pages/api/balance.js
export default function handler(req, res) {
    if (req.method === 'POST') {
      const { sid, userId, currency } = req.body;
  
      // 模擬 SID 和使用者驗證
      if (sid === 'session12345' && userId === 'user123') {
        return res.status(200).json({
          success: true,
          balance: 999.35, // 模擬餘額
          uuid: req.body.uuid,
        });
      }
  
      return res.status(401).json({ success: false, message: 'Invalid session or user' });
    }
  
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  