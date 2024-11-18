import fetch from 'node-fetch'; // 發送 HTTP 請求

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    // 假設用戶驗證邏輯
    if (username === 'testuser' && password === 'password123') {
      const sid = 'session12345';

      try {
        // 向 Evolution 系統發送 User Authentication 請求
        const userAuthResponse = await fetch(process.env.EVOLUTION_USER_AUTH_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.EVOLUTION_API_TOKEN}`,
          },
          body: JSON.stringify({
            sid: sid,
            userId: username,
          }),
        });

        if (!userAuthResponse.ok) {
          throw new Error('Failed to authenticate with Evolution system');
        }

        const userAuthData = await userAuthResponse.json();

        // 驗證成功後返回 sid
        return res.status(200).json({
          success: true,
          sid: sid,
          authToken: userAuthData.authToken,
        });
      } catch (error) {
        console.error('Error during User Authentication:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
