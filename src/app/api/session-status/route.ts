import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripe';

// Get status of checkout session
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const session_id = searchParams.get('session_id');
  const session = await stripe.checkout.sessions.retrieve(session_id);
  return NextResponse.json({ status: session.status });
}