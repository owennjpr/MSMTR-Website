"use client";

import axios from "axios";
import { useState } from "react";

enum PageState {
  ROOM_CODE,
  UPLOAD,
  COMPLETE,
}

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState<string>("waiting");
  const [state, setState] = useState<PageState>(PageState.ROOM_CODE);
  const [code, setCode] = useState<string>("");
  const [validCode, setValidCode] = useState<boolean>(false);

  const updateRoomCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (/^\d{6}$/.test(input)) {
      setCode(input);
      setValidCode(true);
    } else {
      setValidCode(false);
      setCode("");
    }
  };
  const enterRoomCode = () => {
    if (validCode) {
      setState(PageState.UPLOAD);
    }
  };

  const handleUpload = async () => {
    try {
      setStatus("Clearing previous uploads...");
      await axios.delete("/api/upload", { params: { code } });

      setStatus("Uploading...");
      if (!files) throw Error("no files uploaded");
      await Promise.all(
        Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append("audio", file);
          formData.append("code", code);
          const response = await axios.post("/api/upload", formData);
          return response;
        })
      );
      setStatus(
        "Uploaded Successfully! Type the room code into Unity to fetch the files!"
      );
    } catch (error) {
      setStatus("Upload Failed: " + error);
    }
  };
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center gap-4">
      <p className="text-2xl font-bold">Synesthesiazer</p>
      {state == PageState.ROOM_CODE && (
        <>
          <label htmlFor="roomcode">Create 6 Digit Room Code</label>
          <input
            id="roomcode"
            name="roomcode"
            inputMode="numeric"
            maxLength={6}
            type="text"
            onChange={updateRoomCode}
            className={`border-2 ${
              validCode ? "border-green-400" : "border-red-400"
            } rounded-md text-foreground text-center py-2`}
          />
          {validCode && (
            <button
              onClick={enterRoomCode}
              className="cursor-pointer border-2 border-white rounded-md px-8 py-2"
            >
              Enter
            </button>
          )}
        </>
      )}
      {state == PageState.UPLOAD && (
        <>
          <p>Room: {code}</p>
          <label
            htmlFor="audio"
            className="cursor-pointer border-2 border-white rounded-md px-8 py-2"
          >
            {files ? "Replace" : "Choose"} Audio Files
          </label>
          <input
            id="audio"
            name="audio"
            className="hidden"
            type="file"
            accept=".wav,.mp3"
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
              onClick={handleUpload}
              className="cursor-pointer border-2 border-white rounded-md px-8 py-2"
            >
              Upload
            </button>
          )}
          {status !== "waiting" && (
            <p className="text-lg text-gray-400">{status}</p>
          )}
        </>
      )}
      {state == PageState.COMPLETE && null}
    </div>
  );
}
