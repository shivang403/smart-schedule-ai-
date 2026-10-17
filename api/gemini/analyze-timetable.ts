import { GoogleGenAI, Type } from '@google/genai';

type Request = {
  method?: string;
  body?: unknown;
};

type Response = {
  status(code: number): Response;
  json(body: unknown): void;
};

type Timetable = {
  name?: string;
  slots: Array<{ teacherName?: string }>;
  conflictCount?: number;
  healthScore?: number;
  teacherWorkloadScore?: number;
  roomUtilizationRate?: number;
  unscheduledItems?: unknown[];
  classSections?: string[];
  constraintCheckResults?: Array<{
    title?: string;
    respected?: boolean;
    details?: string;
  }>;
};

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    res.status(503).json({
      error: 'AI insights are not configured yet. Add GEMINI_API_KEY to the Vercel project environment variables, then redeploy.',
    });
    return;
  }

  const body = req.body as { timetable?: Timetable } | undefined;
  const timetable = body?.timetable;
  if (!timetable || !Array.isArray(timetable.slots)) {
    res.status(400).json({ error: 'Invalid timetable payload provided.' });
    return;
  }

  try {
    const teacherHours: Record<string, number> = {};
    for (const slot of timetable.slots) {
      const name = slot.teacherName || 'Unknown teacher';
      teacherHours[name] = (teacherHours[name] || 0) + 1;
    }

    const constraintSummary = (timetable.constraintCheckResults || []).map((constraint) => ({
      title: constraint.title,
      respected: constraint.respected,
      details: constraint.details,
    }));

    const prompt = `
Analyze this generated college master timetable:
- Name: ${timetable.name || 'College timetable'}
- Scheduled class periods: ${timetable.slots.length}
- Health score (0-100): ${timetable.healthScore ?? 85}
- Conflict count: ${timetable.conflictCount ?? 0}
- Unscheduled sessions: ${timetable.unscheduledItems?.length ?? 0}
- Faculty workload score: ${timetable.teacherWorkloadScore ?? 80}/100
- Room utilization: ${timetable.roomUtilizationRate ?? 65}%
- Sections: ${timetable.classSections?.join(', ') || 'Not provided'}
- Faculty teaching loads: ${JSON.stringify(teacherHours)}
- Constraint audit: ${JSON.stringify(constraintSummary)}

Return exactly three concrete efficiency reasons, one actionable improvement, and a professional two-sentence quality summary. Be factual and do not claim the schedule is conflict-free if conflicts are present.
`;

    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            threeEfficiencyReasons: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            oneImprovementSuggestion: { type: Type.STRING },
            qualitySummary: { type: Type.STRING },
          },
          required: ['threeEfficiencyReasons', 'oneImprovementSuggestion', 'qualitySummary'],
        },
      },
    });

    const analysis = JSON.parse(result.text || '{}');
    res.status(200).json({
      ...analysis,
      analyzedAt: new Date().toISOString(),
      modelUsed: 'gemini-3.8-flash',
    });
  } catch (error) {
    console.error('Gemini analysis error:', error);
    res.status(502).json({ error: 'Gemini could not analyze this timetable. Check the API key and try again.' });
  }
}
