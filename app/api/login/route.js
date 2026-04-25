import { NextResponse } from 'next/server';
import { authenticateUser } from '../../../server/services/db.js';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const result = await authenticateUser(email, password);

    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: result });
  } catch (error) {
    console.error('[Login API] Error:', error.message);
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
