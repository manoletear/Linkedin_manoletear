import fs from "node:fs";
import { supabase } from "../lib/supabase";

export async function uploadImage(
  localPath: string,
  remoteName?: string
): Promise<string> {
  const file = fs.readFileSync(localPath);
  const name = remoteName || `${Date.now()}-linkedin-image.png`;
  const storagePath = `images/${name}`;

  const { data, error } = await supabase.storage
    .from("media")
    .upload(storagePath, file, {
      contentType: "image/png",
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("media")
    .getPublicUrl(storagePath);

  console.log(`Imagen subida: ${urlData.publicUrl}`);
  return urlData.publicUrl;
}

if (require.main === module) {
  const path = process.argv[2] || "out/linkedin-image.png";
  uploadImage(path).catch(console.error);
}
