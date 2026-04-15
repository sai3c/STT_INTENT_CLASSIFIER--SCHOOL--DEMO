import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TRAITS, getTrait, type TraitCode } from '@/lib/traits';

export const runtime = 'nodejs';
export const maxDuration = 60;

const CONFIDENCE_THRESHOLD = 0.7;

function buildPrompt(transcript: string) {
  const traitList = TRAITS.map(
    (t) =>
      `- ${t.code} (${t.name}): ${t.description}\n    positive signals: ${t.positiveAnchors.join(', ')}\n    negative signals: ${t.negativeAnchors.join(', ')}`
  ).join('\n');

  return `You are an assistant classifying a teacher's voice-memo observation about a student into one of 10 behavioral traits.

TRAITS:
${traitList}

TEACHER OBSERVATION:
"${transcript}"

Classify using this rubric:
- valence: "positive" (student did well), "negative" (concern), or "neutral" (observation only)
- score: 1-5 intensity. For positive: 5=exceptional, 3=notable, 1=mild. For negative: 5=serious concern, 3=mild concern, 1=minor.
- confidence: 0.0-1.0 on how sure you are of the trait classification
- evidence_phrases: 1-3 exact short spans from the transcript supporting your choice
- rationale: one sentence explaining the classification

Return ONLY valid JSON in this exact format, no markdown, no code fences:
{
  "trait_code": "ENG|COL|RES|SRG|RSP|INI|RSL|EMP|COM|CUR",
  "valence": "positive|negative|neutral",
  "score": 1-5,
  "confidence": 0.0-1.0,
  "evidence_phrases": ["..."],
  "rationale": "..."
}`;
}

function parseJsonLoose(text: string): any {
  // Strip markdown fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json({ error: 'transcript required' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(buildPrompt(transcript));
    const text = result.response.text();

    let parsed;
    try {
      parsed = parseJsonLoose(text);
    } catch (e) {
      console.error('JSON parse failed:', text);
      return NextResponse.json(
        {
          error: 'AI returned unparseable response',
          raw: text,
          status: 'failed',
        },
        { status: 502 }
      );
    }

    const traitCode = parsed.trait_code as TraitCode;
    const trait = getTrait(traitCode);
    const confidence = Number(parsed.confidence ?? 0);
    const status = confidence < CONFIDENCE_THRESHOLD ? 'needs_review' : 'confirmed';

    return NextResponse.json({
      traitCode,
      traitName: trait?.name ?? null,
      valence: parsed.valence,
      score: parsed.score,
      confidence,
      evidencePhrases: parsed.evidence_phrases ?? [],
      rationale: parsed.rationale ?? '',
      status,
    });
  } catch (err: any) {
    console.error('Classification error:', err);
    return NextResponse.json(
      { error: err.message ?? 'Classification failed' },
      { status: 500 }
    );
  }
}
