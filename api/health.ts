type Request = { method?: string };
type Response = {
  status(code: number): Response;
  json(body: unknown): void;
};

export default function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  res.status(200).json({
    status: 'ok',
    service: 'Smart Schedule AI Server',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
}
