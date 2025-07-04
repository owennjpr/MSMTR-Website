"use client";

import axios from "axios";
import { useState } from "react";

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState<string>("waiting");

  const handleSubmit = async () => {
    try {
      setStatus("Clearing previous uploads...");
      await axios.delete("/api/upload");

      setStatus("Uploading...");
      if (!files) throw Error("no files uploaded");
      await Promise.all(
        Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append("audio", file);
          const response = await axios.post("/api/upload", formData);
          return response;
        })
      );
      setStatus("Uploaded Successfully! Try Refreshing in Unity");
    } catch (error) {
      setStatus("Upload Failed: " + error);
    }
  };
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center gap-4">
      <p className="text-2xl font-bold">Synesthesiazer</p>
      <label
        htmlFor="audio"
        className="cursor-pointer border-2 border-white rounded-md px-8 py-2"
      >
        Choose Audio Files
      </label>
      <input
        id="audio"
        name="audio"
        className="hidden"
        type="file"
        multiple
        onChange={(e) => {
          const inputfiles = e.target.files;
          setFiles(inputfiles);
          setStatus("waiting");
        }}
      />
      <div className="flex flex-col items-center">
        {files &&
          Array.from(files).map((f) => {
            return <p key={f.name}>{f.name}</p>;
          })}
      </div>
      {files && status === "waiting" && (
        <button
          onClick={handleSubmit}
          className="cursor-pointer border-2 border-white rounded-md px-8 py-2"
        >
          Upload
        </button>
      )}
      {status !== "waiting" && (
        <p className="text-lg text-gray-400">{status}</p>
      )}
    </div>
  );
}
