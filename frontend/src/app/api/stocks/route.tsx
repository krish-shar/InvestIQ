import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.MS_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols');

  if (!symbols) {
    return NextResponse.json({ error: 'Symbols query parameter is required' }, { status: 400 });
  }

  const url = `http://api.marketstack.com/v1/eod?access_key=${API_KEY}&symbols=${symbols}&limit=100`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: `API responded with status ${response.status}` }, { status: response.status });
    }

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
