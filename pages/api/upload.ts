import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import fs from "fs";

interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-z0-9.-]/gi, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({ storage });

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
// Helper: delete all files in uploadDir
function clearUploadsFolder() {
  const files = fs.readdirSync(uploadDir);
  for (const file of files) {
    const filePath = path.join(uploadDir, file);
    if (fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
    }
  }
}

export default async function handler(
  req: NextApiRequestWithFile,
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
    try {
      clearUploadsFolder();
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

      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      res.status(200).json({
        success: true,
        url: `/uploads/${req.file.filename}`,
      });
    } catch (err: unknown) {
      res.status(500).json({ error: err || "Upload failed" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
