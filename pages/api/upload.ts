import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";
import multer from "multer";

interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({ storage: multer.memoryStorage() });

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  fn: Function
) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fn(req, res, (result: any) => {
      if (result instanceof Error) reject(result);
      else resolve(result);
    });
  });
}

async function clearSupabaseUploads(req: NextApiRequest) {
  const code = req.query.code as string;

  const { data, error: listError } = await supabase.storage
    .from("audio-files")
    .list(code, { limit: 100 });

  if (listError) throw listError;
  if (!data) return;

  const pathsToDelete = data.map((file) => `${code}/${file.name}`);

  const { error: deleteError } = await supabase.storage
    .from("audio-files")
    .remove(pathsToDelete);

  if (deleteError) throw deleteError;
}

export default async function handler(
  req: NextApiRequestWithFile,
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
    try {
      clearSupabaseUploads(req);
      return res
        .status(200)
        .json({ success: true, message: "Uploads cleared" });
    } catch (err: unknown) {
      return res.status(500).json({ error: err || "Failed to clear uploads" });
    }
  }

  if (req.method === "POST") {
    try {
      await runMiddleware(req, res, upload.single("audio"));

      const file = req.file;

      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }
      const safeName = file.originalname.replace(/[^a-z0-9.-]/gi, "_");
      const filePath = `${req.body.code}/${Date.now()}-${safeName}`;

      const { error } = await supabase.storage
        .from("audio-files")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) throw error;

      const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/audio-files/${filePath}`;

      res.status(200).json({
        success: true,
        url: publicUrl,
      });
    } catch (err: unknown) {
      res.status(500).json({ error: err || "Upload failed" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
