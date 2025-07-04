"use client";

import { useState } from "react";

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);

  const handleSubmit = () => {};
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center gap-4">
      <p className="text-2xl font-bold">Synesthesiazer</p>
      <label
        htmlFor="audio-upload"
        className="cursor-pointer border-2 border-white rounded-md px-8 py-2"
      >
        Choose Audio Files
      </label>
      <input
        id="audio-upload"
        className="hidden"
        type="file"
        multiple
        onChange={(e) => {
          const inputfiles = e.target.files;
          setFiles(inputfiles);
        }}
      />
      <div className="flex flex-col items-center">
        {files &&
          Array.from(files).map((f) => {
            return <p key={f.name}>{f.name}</p>;
          })}
      </div>
      {files && (
        <button
          onClick={handleSubmit}
          className="cursor-pointer border-2 border-white rounded-md px-8 py-2"
        >
          Upload
        </button>
      )}
    </div>
  );
}
