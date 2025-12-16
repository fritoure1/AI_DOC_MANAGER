import axios from 'axios';
import * as searchModel from '../models/history.model';
import * as docModel from '../models/documents.model';

const PYTHON_API_URL = 'http://127.0.0.1:5001';

export const search = async (q: string, userId: number) => {
  if (!q) throw new Error("Recherche vide.");

  try {
    console.log(`[Electron] Demande IA pour : "${q}"`);
    const pythonResponse = await axios.get(`${PYTHON_API_URL}/search`, {
      params: { q, user_id: userId }
    });
    
    const vectorResults = pythonResponse.data;
    
    if (!vectorResults || vectorResults.length === 0) return [];

    const searchEntry = await searchModel.createSearchEntry(userId, q);
    
    const chunkIds = vectorResults.map((r: any) => BigInt(r.chunk_id));
    const textChunks = await docModel.findChunksByIds(chunkIds);
    
    const finalResults = vectorResults.map((vr: any, index: number) => {
        const textData = textChunks.find(c => c.id == vr.chunk_id);
        
        return {
            chunk_id: vr.chunk_id,
            score: vr.score,
            content: textData?.content || "Contenu introuvable",
            file_name: textData?.DOCUMENTS?.file_name || "Fichier inconnu",
            document_id: textData?.document_id.toString(),
            rank: index + 1
        };
    });

    searchModel.saveSearchResults(searchEntry.id, finalResults).catch(console.error);

    return finalResults;

  } catch (error: any) {
    console.error("Erreur Search Controller:", error.message);
    throw new Error("Erreur lors de la recherche IA.");
  }
};