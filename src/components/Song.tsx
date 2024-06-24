import Image from "next/image";
import React, { useState, useRef } from "react";
import { Video } from "youtube-search-scraper";
import {
  CirclePlay,
  Music,
  Clock4,
  History,
  CircleUser,
  SquareArrowOutUpRight,
  Play,
  Pause,
} from "lucide-react";
import { formatViews } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { convertToMp3 } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const Song: React.FC<{ song: Video }> = ({ song }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioLoading, setAudioLoading] = useState<boolean>(false) 
  const [progress, setProgress] = useState<number>(0.0);
  const [downloadClicked, setDownloadClicked] = useState<boolean>(false);
  const [isPlay, setIsPlay] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (isPlay) {
    audioRef.current?.play();
  } else {
    audioRef.current?.pause();
  }

  const handlePlay = (song: Video) => {
    setIsPlay(!isPlay);
    if (!audioUrl) {
      downloadSong(song, true);
    }
  };
  const handleDownload = (song: Video) => {
    downloadSong(song, false);
  };

  const downloadSong = async (song: Video, audioClicked : boolean) => {
    if (downloadClicked) {
      return;
    }
    setIsLoading(true);
    setDownloadClicked(true);

    if (audioClicked) {
      setAudioLoading(true)
    }

    try {
      let currentAudioUrl = audioUrl;

      if (!currentAudioUrl) {
        const response = await fetch(`/api/download?id=${song.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch audio stream.");
        }

        const contentLength = response.headers.get("Content-Length");
        const totalBytes = parseInt(contentLength || "0", 10);
        let receivedBytes = 0;

        const reader = response.body?.getReader();

        if (!reader) {
          throw new Error("Failed to get reader from response body.");
        }

        const stream = new ReadableStream({
          start(controller) {
            function push() {
              reader
                ?.read()
                .then(({ done, value }) => {
                  if (done) {
                    controller.close();
                    return;
                  }
                  receivedBytes += value.length;
                  setProgress((receivedBytes / totalBytes) * 100);
                  controller.enqueue(value);
                  push();
                })
                .catch((err) => {
                  console.error("Error reading stream:", err);
                  controller.error(err);
                });
            }
            push();
          },
        });

        const audioBlob = await new Response(stream).blob();
        currentAudioUrl = await convertToMp3(audioBlob);
        setAudioUrl(currentAudioUrl);
      }

      if (!audioClicked) {
        const sanitizedTitle = song.title;
        const filename = `${sanitizedTitle}.mp3`;
  
        const link = document.createElement("a");
        link.href = currentAudioUrl;
        link.download = filename;
        link.click();
      }
    } catch (err) {
      console.error("Error downloading audio:", err);
      alert("Error downloading audio. Please try again later.");
    } finally {
      setIsLoading(false);
      setAudioLoading(false)
      setDownloadClicked(false);
    }
  };

  return (
    <motion.div
      className="w-full h-[9rem] max-sm:h-[10rem] flex items-center gap-4 rounded-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ y: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="h-full flex items-center justify-center max-sm:w-[35%] w-[20%] relative"
      >
        <Image
          width={200}
          height={200}
          className="rounded-lg object-contain w-full"
          alt={song.title}
          src={song.thumbnail}
        />
        <motion.div
          initial={{ scaleZ: 0 }}
          animate={{ scaleZ: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          {!audioLoading ? (
            <button
              className="rounded-full bg-secondary/50 p-2 flex items-center justify-center"
              onClick={() => handlePlay(song)}
            >
              {isPlay ? <Pause strokeWidth={1} /> : <Play strokeWidth={1} />}
            </button>
          ) : (
            <div>
              <span className="spinner"></span>
            </div>
          )}
        </motion.div>
      </motion.div>
      <div className="max-sm:w-[65%] w-4/5 space-y-2 py-2">
        <motion.p
          className="text-sm max-md:text-xs max-md:line-clamp-1"
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {song.title}
        </motion.p>
        <motion.p
          className="text-sm max-md:text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {song.description}
        </motion.p>
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href={song.channel.link}
          >
            <p className="text-sm max-md:text-xs bg-secondary w-fit px-1 rounded-md hover:text-primary flex gap-1">
              <CircleUser className="text-primary" strokeWidth={1} size={18} />
              {song.channel.name}
            </p>
          </Link>
          <Link
            href={song.link}
            rel="noopener noreferrer"
            className="text-primary"
            target="_blank"
          >
            <SquareArrowOutUpRight strokeWidth={1} size={18} />
          </Link>
        </motion.div>
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <p className="text-sm max-md:text-xs bg-secondary px-1 flex gap-1 rounded-md items-center leading-5">
            <CirclePlay className="text-primary" size={18} strokeWidth={1} />
            {formatViews(song.views)}
          </p>
          <p className="text-sm max-md:text-xs bg-secondary px-1 flex gap-1 items-center rounded-md leading-5">
            <Clock4 className="text-primary" strokeWidth={1} size={18} />
            {song.duration_raw}
          </p>
          <p className="text-sm max-md:text-xs bg-secondary px-1 py-[0.1rem] flex gap-1 items-center rounded-md leading-5">
            <History strokeWidth={1} className="text-primary" size={18} />
            {song.uploaded}
          </p>
        </motion.div>
        <motion.div
          className="flex gap-2 flex-col w-fit"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <Button
            onClick={() => handleDownload(song)}
            variant={"default"}
            className="text-sm flex gap-2 max-md:text-xs"
          >
            <Music strokeWidth={2} size={18} />
            Download MP3
          </Button>
          {isPlay && !isLoading && (
            <audio
              className="hidden"
              autoPlay
              ref={audioRef}
              src={audioUrl}
              controls
            ></audio>
          )}
          {downloadClicked &&
            (!(progress === 100) ? (
              <Progress value={progress} />
            ) : (
              <p className="text-xs text-primary">Converting Please Wait...</p>
            ))}
        </motion.div>
      </div>

      
    </motion.div>
  );
};

export default Song;
