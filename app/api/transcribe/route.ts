import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get('audio') as File | null;

    if (!audio) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Basic audio validation
    if (audio.size < 1000) {
      return NextResponse.json(
        { error: 'Audio too short or silent. Please re-record.' },
        { status: 400 }
      );
    }

    if (audio.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio exceeds 25MB Whisper limit.' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: 'whisper-1',
      language: 'en',
      response_format: 'verbose_json',
    });

    const text = (transcription as any).text?.trim() ?? '';

    if (text.split(/\s+/).length < 3) {
      return NextResponse.json(
        {
          error: 'Transcript too short to classify. Please add more context.',
          transcript: text,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      transcript: text,
      duration: (transcription as any).duration ?? null,
    });
  } catch (err: any) {
    console.error('Transcription error:', err);
    return NextResponse.json(
      { error: err.message ?? 'Transcription failed' },
      { status: 500 }
    );
  }
}
