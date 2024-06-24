import { NextRequest, NextResponse } from 'next/server';
import {Scraper} from 'youtube-search-scraper';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';

  try {
    const yt = new Scraper();
    const results = await yt.search(query);

    return NextResponse.json(results, {status : 200});
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching data from YouTube' }, { status: 500 });
  }
}
