import fs from "node:fs";
import PDFDocument from "pdfkit";

export async function createLinkedInPdf(
  title: string,
  points: string[],
  outputPath: string = "out/linkedin-report.pdf"
): Promise<string> {
  fs.mkdirSync("out", { recursive: true });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    doc.fontSize(24).text(title);
    doc.moveDown();

    points.forEach((point, i) => {
      doc.fontSize(12).text(`${i + 1}. ${point}`);
      doc.moveDown();
    });

    doc.end();

    stream.on("finish", () => {
      console.log(`PDF guardado en ${outputPath}`);
      resolve(outputPath);
    });
    stream.on("error", reject);
  });
}

if (require.main === module) {
  createLinkedInPdf("AI en operaciones: 5 señales que importan", [
    "La ventaja competitiva se mueve del modelo al flujo.",
    "Los copilotos aislados pierden valor frente a sistemas integrados.",
    "La memoria operativa ya no es opcional.",
    "La distribución importa más que el hype.",
    "El verdadero moat está en la orquestación.",
  ]).catch(console.error);
}
