import { NextRequest, NextResponse } from 'next/server';
import { getRecords, saveRecord, type BehaviorRecord } from '@/lib/storage';

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get('studentId') ?? undefined;
  const records = await getRecords(studentId);
  return NextResponse.json({ records });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const record: BehaviorRecord = {
    id: crypto.randomUUID(),
    studentId: body.studentId,
    recordedAt: new Date().toISOString(),
    transcript: body.transcript ?? '',
    traitCode: body.traitCode ?? null,
    traitName: body.traitName ?? null,
    score: body.score ?? null,
    valence: body.valence ?? null,
    confidence: body.confidence ?? 0,
    rationale: body.rationale ?? '',
    evidencePhrases: body.evidencePhrases ?? [],
    status: body.status ?? 'pending',
  };
  await saveRecord(record);
  return NextResponse.json({ record });
}
