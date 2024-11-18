export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    // 調試程式碼：檢查環境變數是否載入
    console.log('EVOLUTION_USER_AUTH_URL:', process.env.EVOLUTION_USER_AUTH_URL);
    console.log('EVOLUTION_API_TOKEN:', process.env.EVOLUTION_API_TOKEN);

    // 檢查環境變數是否存在，避免 undefined 問題
    if (!process.env.EVOLUTION_USER_AUTH_URL || !process.env.EVOLUTION_API_TOKEN) {
      console.error('環境變數未正確載入');
      return res
        .status(500)
        .json({ success: false, message: 'Server configuration error: Missing environment variables' });
    }

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
          console.error(
            `Failed to authenticate with Evolution system: ${userAuthResponse.statusText}`
          );
          throw new Error('Failed to authenticate with Evolution system');
        }

        const userAuthData = await userAuthResponse.json();

        // 驗證成功後返回 sid 和額外的資訊
        return res.status(200).json({
          success: true,
          sid: sid,
          authToken: userAuthData.authToken || 'authTokenExample123',
        });
      } catch (error) {
        console.error('Error during User Authentication:', error.message);
        return res
          .status(500)
          .json({ success: false, message: 'Internal Server Error' });
      }
    }

    return res
      .status(401)
      .json({ success: false, message: 'Invalid credentials' });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
