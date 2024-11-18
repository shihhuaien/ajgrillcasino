// pages/api/debit.js
export default function handler(req, res) {
    if (req.method === 'POST') {
      const { sid, userId, transaction } = req.body;
  
      // 檢查 SID 和用戶驗證
      if (sid === 'session12345' && userId === 'user123') {
        const balance = 999.35; // 假設初始餘額
        const newBalance = balance - transaction.amount;
  
        if (newBalance >= 0) {
          return res.status(200).json({
            success: true,
            newBalance: newBalance,
            uuid: req.body.uuid,
          });
        } else {
          return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }
      }
  
      return res.status(401).json({ success: false, message: 'Invalid session or user' });
    }
  
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }