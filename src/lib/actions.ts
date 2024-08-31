'use server'
import ytdl from '@distube/ytdl-core';

export async function downloadAudio(id : string) {
  try {
    if (!id) {
      throw new Error('Missing required parameter: id');
    }

    const videoUrl = `https://www.youtube.com/watch?v=${id}`;

    const infoPromise = ytdl.getInfo(videoUrl);
    const streamPromise = ytdl(videoUrl, {
      quality: 'highestaudio',
      filter: 'audioonly'
    });

    const [info, stream] = await Promise.all([infoPromise, streamPromise]);
    if (!info) {
      throw new Error(`Failed to fetch video info for ID: ${id}`);
    }

    const estimatedSize = parseInt(info.formats.find((format) => format.audioBitrate === 160)?.contentLength || '0', 10);

    return [estimatedSize, stream]

  } catch (error) {
    console.error('Error streaming audio:', error);
    return new Response('Error streaming audio. Please try again later.', { status: 500 });
  }
}
