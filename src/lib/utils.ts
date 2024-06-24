import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import {FFmpeg} from '@ffmpeg/ffmpeg'
import { fetchFile } from "@ffmpeg/util"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatViews(views : number) {
  if (views < 1e3) return views.toString();
  if (views >= 1e3 && views < 1e5) return (views / 1e3).toFixed(1) + 'K';
  if (views >= 1e5 && views < 1e7) return (views / 1e5).toFixed(1) + 'L';
  if (views >= 1e7 && views < 1e10) return (views / 1e6).toFixed(1) + 'M';
  return (views / 1e7).toFixed(1) + 'Cr';
}

export async function convertToMp3(audioBlob : Blob) {
  const ffmpeg = new FFmpeg()
  try {
    if (!ffmpeg.loaded) {
      await ffmpeg.load()
    }
    ffmpeg.writeFile('audio.wav', await fetchFile(audioBlob))
    await ffmpeg.exec(['-i', 'audio.wav', 'output.mp3'])
    const data = await ffmpeg.readFile('output.mp3')
    const mp3Blob = new Blob([data], {type : 'audio/mpeg'})
    const mp3Url = URL.createObjectURL(mp3Blob)
    return mp3Url
  } catch (err) {
    console.error('Error converting audio.', err)
    throw new Error('Failed to convert audioBlob to mp3.')
  }
}

