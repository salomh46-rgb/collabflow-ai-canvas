import https from 'https';

export interface GeneratedDiagramElement {
  type: 'rectangle' | 'circle' | 'arrow' | 'sticky' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
  fillColor?: string;
}

export async function generateAIDiagram(prompt: string, apiKey: string): Promise<GeneratedDiagramElement[]> {
  const systemPrompt = `You are a Systems Architecture and Diagramming AI Assistant.
Convert the user prompt into a structured 2D visual diagram/flowchart.

USER REQUEST: "${prompt}"

OUTPUT FORMAT: Strict JSON array of elements with visual coordinates (x between 100-1200, y between 100-800).
Rules:
- Place related components left-to-right or top-to-bottom with proper spacing (150-250px apart).
- Connect components logically with arrows.
- Use clean modern hex colors (#38BDF8 for services, #34D399 for databases, #F472B6 for clients, #FBBF24 for queues/caches).

JSON Structure:
[
  {
    "type": "rectangle" | "circle" | "sticky" | "arrow",
    "x": 150,
    "y": 200,
    "width": 160,
    "height": 70,
    "text": "Client App (Next.js)",
    "color": "#38BDF8",
    "fillColor": "#0F172A"
  }
]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
  const payload = JSON.stringify({
    contents: [{ parts: [{ text: systemPrompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
  });

  return new Promise((resolve) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const rawText = parsed.candidates[0].content.parts[0].text;
          const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, rawText];
          const cleanJson = jsonMatch[1].trim();
          resolve(JSON.parse(cleanJson));
        } catch (e) {
          // Fallback diagram
          resolve([
            { type: 'rectangle', x: 200, y: 250, width: 180, height: 80, text: 'Client (Frontend)', color: '#38BDF8', fillColor: '#0F172A' },
            { type: 'arrow', x: 380, y: 290, width: 120, height: 2, text: 'HTTP / WS', color: '#94A3B8' },
            { type: 'rectangle', x: 500, y: 250, width: 180, height: 80, text: 'API Gateway (Node.js)', color: '#F472B6', fillColor: '#0F172A' },
            { type: 'arrow', x: 680, y: 290, width: 120, height: 2, text: 'Queries', color: '#94A3B8' },
            { type: 'rectangle', x: 800, y: 250, width: 180, height: 80, text: 'PostgreSQL Database', color: '#34D399', fillColor: '#0F172A' }
          ]);
        }
      });
    });

    req.on('error', () => {
      resolve([]);
    });

    req.write(payload);
    req.end();
  });
}
