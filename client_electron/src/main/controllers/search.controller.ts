import axios from 'axios';
import * as searchModel from '../models/history.model'; // On utilise history.model pour écrire la recherche
import * as docModel from '../models/documents.model';

const PYTHON_API_URL = 'http://127.0.0.1:5001';

export const search = async (q: string, userId: number) => {
  if (!q) throw new Error("Recherche vide.");

  try {
    // 1. APPEL PYTHON (Juste pour les IDs et Scores)
    console.log(`[Electron] Demande IA pour : "${q}"`);
    const pythonResponse = await axios.get(`${PYTHON_API_URL}/search`, {
      params: { q, user_id: userId }
    });
    
    // On reçoit : [{ chunk_id: 12, score: 0.8 }, ...]
    const vectorResults = pythonResponse.data;
    
    if (!vectorResults || vectorResults.length === 0) return [];

    // 2. SAUVEGARDE HISTORIQUE (REQUÊTE)
    const searchEntry = await searchModel.createSearchEntry(userId, q);
    
    // 3. RÉCUPÉRATION DU TEXTE (Depuis MySQL via Prisma)
    const chunkIds = vectorResults.map((r: any) => BigInt(r.chunk_id));
    const textChunks = await docModel.findChunksByIds(chunkIds);
    
    // 4. FUSION DES DONNÉES
    const finalResults = vectorResults.map((vr: any, index: number) => {
        // On retrouve le texte correspondant à l'ID
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

    // 5. SAUVEGARDE RÉSULTATS (Lien Search <-> Chunks)
    // On le fait en arrière-plan (pas besoin d'attendre pour répondre au front)
    searchModel.saveSearchResults(searchEntry.id, finalResults).catch(console.error);

    return finalResults;

  } catch (error: any) {
    console.error("Erreur Search Controller:", error.message);
    throw new Error("Erreur lors de la recherche IA.");
  }
};