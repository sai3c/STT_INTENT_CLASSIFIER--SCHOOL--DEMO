'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Student } from '@/lib/storage';

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/students')
      .then((r) => r.json())
      .then((d) => {
        setStudents(d.students);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Grade 5 — Section A</h1>
        <p className="text-sm text-slate-500">Tap a student to record an observation</p>
      </header>

      {loading ? (
        <p className="text-slate-500">Loading roster…</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {students.map((s) => (
            <Link
              key={s.id}
              href={`/student/${s.id}`}
              className="bg-white rounded-xl shadow-sm active:scale-95 transition-transform p-2 flex flex-col items-center"
            >
              <img
                src={s.photoUrl}
                alt={s.firstName}
                className="w-16 h-16 rounded-full bg-slate-100"
              />
              <span className="mt-2 text-xs font-medium text-slate-700 text-center leading-tight">
                {s.firstName}
                <br />
                <span className="text-slate-400">{s.lastName}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
