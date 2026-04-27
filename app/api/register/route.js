import { NextResponse } from 'next/server';
import { saveUser } from '../../../server/services/db.js';
import { sendWelcomeEmail } from '../../../server/services/emailService.js';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const result = await saveUser(name, email, password);

    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Send welcome email (fire-and-forget — don't block the response)
    sendWelcomeEmail(email, name).catch(err =>
      console.error('[Register API] Welcome email failed:', err.message)
    );

    return NextResponse.json({ success: true, user: result });
  } catch (error) {
    console.error('[Register API] Error:', error.message);
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}
