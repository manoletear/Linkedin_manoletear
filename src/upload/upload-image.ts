import fs from "node:fs";

/**
 * Verifica que una imagen local existe y retorna su path.
 * Para subir a Supabase Storage, configurar SUPABASE_URL en .env.
 */
export function verifyImage(localPath: string): string {
  if (!fs.existsSync(localPath)) {
    throw new Error(`Image not found: ${localPath}`);
  }
  console.log(`Imagen verificada: ${localPath}`);
  return localPath;
}

if (require.main === module) {
  const path = process.argv[2] || "out/linkedin-image.png";
  verifyImage(path);
}
