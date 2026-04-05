import fs from "node:fs";

/**
 * Verifica que un PDF local existe y retorna su path.
 */
export function verifyPdf(localPath: string): string {
  if (!fs.existsSync(localPath)) {
    throw new Error(`PDF not found: ${localPath}`);
  }
  console.log(`PDF verificado: ${localPath}`);
  return localPath;
}

if (require.main === module) {
  const path = process.argv[2] || "out/linkedin-report.pdf";
  verifyPdf(path);
}
