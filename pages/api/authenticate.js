
export default function handler(req, res) {
    if (req.method === 'POST') {
      const { username, password } = req.body;
  
      // 模擬憑證驗證
      if (username === 'testuser' && password === 'password123') {
        return res.status(200).json({
          success: true,
          sid: 'session12345',
        });
      }
  
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  