import axios from 'axios';
import fs from 'fs';
import path from 'path';
import * as fileParser from '../services/file.parser';
import * as textSplitter from '../services/text.splitter';
import * as docModel from '../models/documents.model'; // On utilise les nouvelles fonctions

const PYTHON_API_URL = 'http://127.0.0.1:5001';

export const upload = async (sourceFilePath: string, userId: number) => {
  try {
    console.log(`[Electron] 1. Lecture : ${sourceFilePath}`);
    const { text, metadata } = await fileParser.parseFile(sourceFilePath);

    if (!text || text.trim().length === 0) throw new Error("Fichier vide.");

    console.log(`[Electron] 2. Découpage...`);
    const chunksText = await textSplitter.splitText(text);

    console.log(`[Electron] 3. Sauvegarde en Base de Données...`);
    
    const uploadDir = path.resolve(process.cwd(), '../client_electron/uploaded_docs', userId.toString());
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    
    const fileName = path.basename(sourceFilePath);
    const destPath = path.join(uploadDir, fileName);
    fs.copyFileSync(sourceFilePath, destPath);
    
    const relativeDbPath = path.join('uploaded_docs', userId.toString(), fileName);
    const docType = path.extname(fileName).replace('.', '');

   
    const newDoc = await docModel.createDocument(userId, fileName, relativeDbPath, docType);
    const docId = newDoc.id;

    for (const [key, value] of Object.entries(metadata)) {
        await docModel.addMetadata(docId, key, String(value));
    }

   const savedChunks = await docModel.createChunks(docId, chunksText);
    
    const chunksPayload = savedChunks.map(c => ({
        id: Number(c.id), 
        text: c.content
    }));

    console.log(`[Electron] 4. Envoi pour vectorisation (${chunksPayload.length} chunks)...`);
    
    const pythonResponse = await axios.post(`${PYTHON_API_URL}/vectorize`, {
      user_id: userId,
      document_id: Number(docId),
      chunks: chunksPayload 
    });

    return pythonResponse.data;
    
  } catch (error: any) {
    console.error("Erreur Upload:", error.message);
    if (error.response) throw new Error(`Erreur Python: ${JSON.stringify(error.response.data)}`);
    throw error;
  }
}