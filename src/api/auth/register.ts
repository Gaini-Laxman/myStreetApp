export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body;

  return res.status(200).json({
    user: {
      id: Date.now().toString(),
      email,
      isAdmin: false,
    },
  });
}