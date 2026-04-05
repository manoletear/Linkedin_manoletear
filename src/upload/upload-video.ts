import fs from "node:fs";

/**
 * Verifica que un video local existe y retorna su path.
 */
export function verifyVideo(localPath: string): string {
  if (!fs.existsSync(localPath)) {
    throw new Error(`Video not found: ${localPath}`);
  }
  console.log(`Video verificado: ${localPath}`);
  return localPath;
}

if (require.main === module) {
  const path = process.argv[2] || "out/news-video.mp4";
  verifyVideo(path);
}
