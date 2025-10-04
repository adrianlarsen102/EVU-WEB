import { verifyLogin, createSession } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username = 'admin', password } = req.body;
  const admin = await verifyLogin(username, password);

  if (admin) {
    const sessionId = await createSession(admin.id);
    res.setHeader('Set-Cookie', `sessionId=${sessionId}; Path=/; HttpOnly; SameSite=Strict`);
    res.status(200).json({
      success: true,
      isDefaultPassword: admin.isDefaultPassword
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
}
