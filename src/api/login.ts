export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (email === 'admin@mystreet.com' && password === 'Admin@123') {
    return res.status(200).json({
      id: 1,
      email,
      role: 'admin',
      name: 'Admin'
    });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
}