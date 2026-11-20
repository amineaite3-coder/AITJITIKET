import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface MapsLink {
  title: string;
  uri: string;
}

interface ReviewSnippet {
  text: string;
  uri?: string;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.post('/api/venue-info', async (req, res) => {
    try {
      const { venue, city, country, lang } = req.body as {
        venue?: string;
        city?: string;
        country?: string;
        lang?: string;
      };

      if (!venue || !city) {
        return res.status(400).json({ error: 'Venue and city are required.' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured on the server.',
        });
      }

      const targetLang =
        lang === 'en' ? 'English' : lang === 'ar' ? 'Arabic' : 'French';

      const prompt = `Provide concise, practical, up-to-date visitor information in ${targetLang} for the event venue "${venue}" in ${city}${country ? `, ${country}` : ''}. Include its exact location/neighborhood, how to get there by public transit, and 2-3 helpful nearby landmarks or tips for attendees. Keep the response concise (under 140 words) and factual.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });

      const text = response.text || '';
      const chunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      const mapLinks: MapsLink[] = [];
      const seenUris = new Set<string>();
      const reviewSnippets: ReviewSnippet[] = [];

      for (const chunk of chunks) {
        const mapsData = (chunk as {
          maps?: {
            uri?: string;
            title?: string;
            placeAnswerSources?: {
              reviewSnippets?: Array<{
                content?: string;
                text?: string;
                uri?: string;
              }>;
            };
          };
        }).maps;

        if (mapsData?.uri && !seenUris.has(mapsData.uri)) {
          seenUris.add(mapsData.uri);
          mapLinks.push({
            title: mapsData.title || venue,
            uri: mapsData.uri,
          });
        }

        const snippets = mapsData?.placeAnswerSources?.reviewSnippets;
        if (Array.isArray(snippets)) {
          for (const snippet of snippets) {
            const content = snippet.content || snippet.text;
            if (content) {
              reviewSnippets.push({
                text: content,
                uri: snippet.uri || mapsData?.uri,
              });
            }
          }
        }
      }

      return res.json({
        text,
        mapLinks,
        reviewSnippets: reviewSnippets.slice(0, 3),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to retrieve Google Maps venue details.';
      console.error('Maps Grounding error:', err);
      return res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AITJITIKET server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
