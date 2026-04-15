import fs from 'fs/promises';
import path from 'path';
import type { TraitCode } from './traits';

const DATA_DIR = path.join(process.cwd(), 'data');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  photoUrl: string;
}

export interface BehaviorRecord {
  id: string;
  studentId: string;
  recordedAt: string;
  transcript: string;
  traitCode: TraitCode | null;
  traitName: string | null;
  score: number | null;
  valence: 'positive' | 'negative' | 'neutral' | null;
  confidence: number;
  rationale: string;
  evidencePhrases: string[];
  status: 'pending' | 'confirmed' | 'needs_review' | 'failed';
}

async function ensureFile(file: string, initial: string) {
  try {
    await fs.access(file);
  } catch {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, initial);
  }
}

export async function getStudents(): Promise<Student[]> {
  await ensureFile(STUDENTS_FILE, '[]');
  const raw = await fs.readFile(STUDENTS_FILE, 'utf-8');
  return JSON.parse(raw);
}

export async function getStudent(id: string): Promise<Student | null> {
  const students = await getStudents();
  return students.find((s) => s.id === id) ?? null;
}

export async function getRecords(studentId?: string): Promise<BehaviorRecord[]> {
  await ensureFile(RECORDS_FILE, '[]');
  const raw = await fs.readFile(RECORDS_FILE, 'utf-8');
  const all: BehaviorRecord[] = JSON.parse(raw);
  return studentId ? all.filter((r) => r.studentId === studentId) : all;
}

export async function saveRecord(record: BehaviorRecord): Promise<void> {
  const all = await getRecords();
  all.push(record);
  await fs.writeFile(RECORDS_FILE, JSON.stringify(all, null, 2));
}
