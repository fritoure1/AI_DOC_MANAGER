import fs from 'fs';
import path from 'path';
import * as docModel from '../models/documents.model.ts';

const serializeBigInt = (data: any) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

export const getUserDocuments = async (userId: number) => {
  try {
    const docs = await docModel.findAllByUser(userId);
    
    return serializeBigInt(docs);
  } catch (error) {
    console.error("Erreur récupération documents:", error);
    throw new Error("Erreur serveur." );
  }
};

export const deleteDocument = async (id: number, userId: number) => {
    const documentId = BigInt(id);
    const doc = await docModel.findById(documentId);

    if (!doc) {
      throw new Error("Document introuvable." );
    }

    if (doc.user_id.toString() !== userId.toString()) {
      throw new Error("Accès interdit." );
    }

    const absolutePath = path.resolve(process.cwd(), '../client_electron/uploaded_docs', doc.file_path);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (err) {
        console.error("Erreur suppression fichier:", err);
      }
    }

    await docModel.deleteById(documentId);
    return { message: "Document supprimé." };
};

export const getDocumentFile = async (id: number, userId: number) => {
  const documentId = BigInt(id);
  const doc = await docModel.findById(documentId);

  if (!doc) throw new Error("Document introuvable.");
  if (doc.user_id.toString() !== userId.toString()) throw new Error("Accès interdit.");

  const fileName = path.basename(doc.file_path); 
  const absolutePath = path.resolve(process.cwd(), '../client_electron/uploaded_docs', userId.toString(), fileName);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error("Fichier physique introuvable sur le disque.");
  }

  return absolutePath;
};