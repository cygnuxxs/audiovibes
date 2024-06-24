"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholderVanish";
import { Results } from "youtube-search-scraper";
import Song from "./Song";
import Loading from "@/app/loading";

const Form = () => {
  const [songName, setSongName] = useState<string>("#trendingmusic");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [key, setKey] = useState<number>(0);
  const [songs, setSongs] = useState<Results | undefined>(undefined);

  const placeholders = [
    "Search for your favourite music",
    "You can search by YouTube URL also",
  ];

  const fetchData = async () => {
    setIsLoading(true)
    fetch(`/api/search?query=${encodeURIComponent(songName)}`)
      .then((response) => response.json())
      .then((data) => {
        setSongs(data)
        setKey((prevKey) => prevKey + 1)
      })
      .catch((err) => console.error("Failed to fetch data.", err)).finally(() => {
        setIsLoading(false)
      })
  };


  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    fetchData();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSongName(event.target.value);
  };

  return (
    <div className="w-full h-[95%] pb-2">
      <div className="w-full h-[10%]">
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>
      <div className="w-full h-[90%] overflow-y-scroll">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loading />
          </div>
        ) : (
          <div key={key} className="flex flex-col h-fit gap-4 pb-4">
            {songs?.videos.map((song, idx) => (
              <Song song={song} key={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Form;
