import { NextRequest, NextResponse } from "next/server";
import ytdl from '@distube/ytdl-core'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing required parameter: id' }, { status: 400 });
    }
    
    const videoUrl = `https://www.youtube.com/watch?v=${id}`;

    const info = await ytdl.getInfo(videoUrl);
    const stream = ytdl(videoUrl, { 
      quality: 'highestaudio',
      filter: 'audioonly'
    });

    if (!info) {
      return NextResponse.json({ error: `Failed to fetch video info for ID: ${id}` }, { status: 500 });
    }

    const sanitizedTitle = info.videoDetails.title.replace(/[^\w\s]/gi, ''); // Remove non-word characters

    const estimatedSize = parseInt(info.formats.find((format) => format.audioBitrate === 160)?.contentLength || '0', 10);

    const headers = new Headers();
    headers.append('Content-Type', 'audio/mpeg');
    headers.append('Content-Disposition', `attachment; filename="${sanitizedTitle}.mp3"`);
    headers.append('Content-Length', estimatedSize.toString());

    const readableStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Uint8Array) => {
          controller.enqueue(chunk);
        });

        stream.on('end', () => {
          controller.close();
        });

        stream.on('error', (error) => {
          controller.error(error);
        });
      }
    });
    return new NextResponse(readableStream, { headers });

  } catch (error) {
    console.error('Error streaming audio:', error);
    if (error instanceof Error) {
      return new NextResponse('Error Streaming Audio. Please check your code', {status : 500,statusText : error.message}, )
    }
    return new NextResponse('Error streaming audio. Please try again later.', { status: 500 });
  }
}
