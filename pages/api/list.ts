// pages/api/list.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const code = req.query.code as string;
    const { data, error } = await supabase.storage
      .from("audio-files")
      .list(code, { limit: 100 });

    if (error) throw error;

    const urls = data.map((file) => {
      return `${process.env.SUPABASE_URL}/storage/v1/object/public/audio-files/${code}/${file.name}`;
    });

    res.status(200).json({ urls });
  } catch (err) {
    res.status(500).json({ error: err || "Could not list files" });
  }
}
