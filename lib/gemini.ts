import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function requireClient() {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not set. Add it to your environment to enable AI features.');
  }
  return genAI;
}

/**
 * Transcribe an audio/video file with word-level timing using Gemini's
 * multimodal understanding, and return SRT-ready caption segments.
 */
export async function transcribeForSubtitles(filePath: string, mimeType = 'audio/mp4') {
  const client = requireClient();
  const model = client.getGenerativeModel({ model: 'gemini-3.6-flash' });

  const fileBuffer = fs.readFileSync(filePath);
  const base64 = fileBuffer.toString('base64');

  const prompt = `Transcribe the spoken audio in this file. Return ONLY strict JSON,
no markdown fences, no commentary, in this exact shape:
{"segments":[{"start":0.0,"end":2.4,"text":"..."}]}
Segments should be short (max ~8 words) and timestamps in seconds relative to file start.`;

  const result = await Promise.race([
    model.generateContent([
      { inlineData: { data: base64, mimeType } },
      { text: prompt },
    ]),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini transcription timed out (rate limited or unavailable)')), 20000)
    ),
  ]);

  const raw = result.response.text().replace(/```json|```/g, '').trim();
  try {
    const parsed = JSON.parse(raw);
    return parsed.segments as { start: number; end: number; text: string }[];
  } catch {
    return [];
  }
}

/** Generate a title, description, and hashtags for the finished video. */
export async function generateMetadata(context: string) {
  const client = requireClient();
  const model = client.getGenerativeModel({ model: 'gemini-3.6-flash' });
  const prompt = `Based on this description of a short video: "${context}", write:
1. A catchy title (max 8 words)
2. A one-sentence description
3. 8 relevant hashtags
Return ONLY strict JSON: {"title":"...","description":"...","hashtags":["..."]}`;
  const result = await Promise.race([
    model.generateContent(prompt),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini metadata generation timed out')), 20000)
    ),
  ]);
  const raw = result.response.text().replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(raw) as { title: string; description: string; hashtags: string[] };
  } catch {
    return { title: 'Untitled', description: '', hashtags: [] };
  }
}
