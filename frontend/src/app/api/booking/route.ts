import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Booking request received:', body);
    return NextResponse.json({ success: true, message: 'Booking received successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to process booking' }, { status: 400 });
  }
}