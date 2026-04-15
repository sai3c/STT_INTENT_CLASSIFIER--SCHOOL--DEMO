import { NextResponse } from 'next/server';
import { getStudents } from '@/lib/storage';

export async function GET() {
  const students = await getStudents();
  return NextResponse.json({ students });
}
