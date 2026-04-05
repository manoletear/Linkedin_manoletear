import fs from "node:fs";
import { supabase } from "../lib/supabase";

export async function uploadVideo(
  localPath: string,
  remoteName?: string
): Promise<string> {
  const file = fs.readFileSync(localPath);
  const name = remoteName || `${Date.now()}-news-video.mp4`;
  const storagePath = `video/${name}`;

  const { data, error } = await supabase.storage
    .from("media")
    .upload(storagePath, file, {
      contentType: "video/mp4",
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("media")
    .getPublicUrl(storagePath);

  console.log(`Video subido: ${urlData.publicUrl}`);
  return urlData.publicUrl;
}

if (require.main === module) {
  const path = process.argv[2] || "out/news-video.mp4";
  uploadVideo(path).catch(console.error);
}
