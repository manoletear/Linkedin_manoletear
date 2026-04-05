import fs from "node:fs";
import { supabase } from "../lib/supabase";

export async function uploadPdf(
  localPath: string,
  remoteName?: string
): Promise<string> {
  const file = fs.readFileSync(localPath);
  const name = remoteName || `${Date.now()}-linkedin-report.pdf`;
  const storagePath = `pdf/${name}`;

  const { data, error } = await supabase.storage
    .from("media")
    .upload(storagePath, file, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("media")
    .getPublicUrl(storagePath);

  console.log(`PDF subido: ${urlData.publicUrl}`);
  return urlData.publicUrl;
}

if (require.main === module) {
  const path = process.argv[2] || "out/linkedin-report.pdf";
  uploadPdf(path).catch(console.error);
}
