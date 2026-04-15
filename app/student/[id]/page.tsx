'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Student, BehaviorRecord } from '@/lib/storage';

type Status = 'idle' | 'recording' | 'uploading' | 'transcribing' | 'classifying' | 'done' | 'error';

interface ClassifyResult {
  traitCode: string;
  traitName: string;
  valence: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  evidencePhrases: string[];
  rationale: string;
  status: 'confirmed' | 'needs_review';
}

export default function StudentPage() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [records, setRecords] = useState<BehaviorRecord[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    fetch('/api/students')
      .then((r) => r.json())
      .then((d) => setStudent(d.students.find((s: Student) => s.id === studentId) ?? null));
    loadRecords();
  }, [studentId]);

  async function loadRecords() {
    const r = await fetch(`/api/records?studentId=${studentId}`);
    const d = await r.json();
    setRecords(d.records.reverse());
  }

  async function startRecording() {
    setError('');
    setResult(null);
    setTranscript('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(blob);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setStatus('recording');
    } catch (e: any) {
      setError('Mic access denied. Check browser permissions.');
      setStatus('error');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  async function processAudio(blob: Blob) {
    setStatus('uploading');
    try {
      // Transcribe
      setStatus('transcribing');
      const form = new FormData();
      form.append('audio', blob, 'memo.webm');
      const tRes = await fetch('/api/transcribe', { method: 'POST', body: form });
      const tData = await tRes.json();
      if (!tRes.ok) throw new Error(tData.error || 'Transcription failed');
      setTranscript(tData.transcript);

      // Classify
      setStatus('classifying');
      const cRes = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: tData.transcript }),
      });
      const cData = await cRes.json();
      if (!cRes.ok) throw new Error(cData.error || 'Classification failed');
      setResult(cData);

      // Save record
      await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          transcript: tData.transcript,
          ...cData,
        }),
      });

      await loadRecords();
      setStatus('done');
    } catch (e: any) {
      setError(e.message);
      setStatus('error');
    }
  }

  if (!student) return <main className="p-4">Loading…</main>;

  const valenceColor = (v: string | null) =>
    v === 'positive' ? 'bg-green-100 text-green-800'
    : v === 'negative' ? 'bg-red-100 text-red-800'
    : 'bg-slate-100 text-slate-700';

  return (
    <main className="min-h-screen bg-slate-50 p-4 max-w-md mx-auto">
      <Link href="/" className="text-sm text-blue-600">← Back to class</Link>

      <div className="mt-4 flex items-center gap-3">
        <img src={student.photoUrl} alt="" className="w-16 h-16 rounded-full bg-slate-100" />
        <div>
          <h1 className="text-xl font-bold">{student.firstName} {student.lastName}</h1>
          <p className="text-sm text-slate-500">Grade {student.grade}</p>
        </div>
      </div>

      <section className="mt-6 bg-white rounded-xl p-4 shadow-sm">
        <h2 className="font-semibold mb-3">Record observation</h2>

        {status === 'idle' || status === 'done' || status === 'error' ? (
          <button
            onClick={startRecording}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold active:bg-blue-700"
          >
            🎤 Start recording
          </button>
        ) : status === 'recording' ? (
          <button
            onClick={stopRecording}
            className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold animate-pulse"
          >
            ⏹ Stop recording
          </button>
        ) : (
          <div className="text-center py-4 text-slate-600">
            <div className="inline-block animate-spin mr-2">⏳</div>
            {status === 'uploading' && 'Uploading…'}
            {status === 'transcribing' && 'Transcribing with Whisper…'}
            {status === 'classifying' && 'Analyzing with Gemini…'}
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}
      </section>

      {transcript && (
        <section className="mt-4 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-1">Transcript</h3>
          <p className="text-slate-800 italic">"{transcript}"</p>
        </section>
      )}

      {result && (
        <section className="mt-4 bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{result.traitName}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${valenceColor(result.valence)}`}>
              {result.valence} · score {result.score}/5
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-2">{result.rationale}</p>
          {result.evidencePhrases.length > 0 && (
            <div className="mt-2 text-xs text-slate-500">
              Evidence: {result.evidencePhrases.map((p) => `"${p}"`).join(', ')}
            </div>
          )}
          <div className="mt-2 text-xs">
            Confidence: {(result.confidence * 100).toFixed(0)}%
            {result.status === 'needs_review' && (
              <span className="ml-2 text-amber-600 font-semibold">⚠ Needs your review</span>
            )}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="font-semibold mb-2 text-slate-700">Recent observations</h2>
        {records.length === 0 ? (
          <p className="text-sm text-slate-400">No records yet.</p>
        ) : (
          <ul className="space-y-2">
            {records.slice(0, 10).map((r) => (
              <li key={r.id} className="bg-white rounded-lg p-3 shadow-sm text-sm">
                <div className="flex justify-between items-start">
                  <span className="font-medium">{r.traitName ?? 'Uncategorized'}</span>
                  {r.score && (
                    <span className={`text-xs px-2 py-0.5 rounded ${valenceColor(r.valence)}`}>
                      {r.valence} {r.score}/5
                    </span>
                  )}
                </div>
                <p className="text-slate-600 mt-1 italic text-xs">"{r.transcript}"</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(r.recordedAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
