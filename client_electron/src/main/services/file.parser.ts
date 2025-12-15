import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { extractText, getDocumentProxy, getMeta } from 'unpdf';

export const parseFile = async (
  filePath: string
): Promise<{ text: string; metadata: any }> => {
  const ext = path.extname(filePath).toLowerCase();

  const buffer = fs.readFileSync(filePath);
  const stats = fs.statSync(filePath);

  let text = '';
  let metadata: any = {
    file_size: stats.size,
    file_format: ext.replace('.', ''),
    title: path.basename(filePath),
  };

  try {
    if (ext === '.pdf') {
      // Charger le PDF via unpdf
      const pdf = await getDocumentProxy(new Uint8Array(buffer));

      // Extraire le texte (toutes les pages fusionnées en une string)
      const { totalPages, text: extracted } = await extractText(pdf, {
        mergePages: true,
      });

      text = Array.isArray(extracted) ? extracted.join('\n') : extracted;
      metadata.page_count = totalPages;

      // (Optionnel) récupérer les métadatas du PDF
      try {
        const { info, metadata: meta } = await getMeta(pdf);
        metadata = { ...metadata, ...info, ...meta };
      } catch (e) {
        console.warn('Impossible de lire les métadonnées PDF :', e);
      }

    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;

    } else if (ext === '.txt' || ext === '.md') {
      text = buffer.toString('utf-8');

    } else {
      throw new Error(`Format ${ext} non supporté.`);
    }

    return { text, metadata };

  } catch (error: any) {
    console.error('Erreur parsing:', error);
    throw new Error(`Impossible de lire le fichier : ${error.message ?? String(error)}`);
  }
};
