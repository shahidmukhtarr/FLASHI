import { NextResponse } from 'next/server';
import { saveUser } from '../../../server/services/db.js';

export async function POST(request) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const result = await saveUser(name, email);

    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: result });
  } catch (error) {
    console.error('[Login API] Error:', error.message);
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
