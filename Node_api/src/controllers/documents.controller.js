import fs from 'fs';
import path from 'path';
import * as docModel from '../models/documents.model.js';

const serializeBigInt = (data) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

export const getUserDocuments = async (req, res) => {
  try {
    const userId = req.userData.userId;

    const docs = await docModel.findAllByUser(userId);

    const cleanDocs = serializeBigInt(docs);
    res.status(200).json(cleanDocs);

  } catch (error) {
    console.error("Erreur récupération documents:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const documentId = BigInt(req.params.id);
    const userId = req.userData.userId;

    const doc = await docModel.findById(documentId);

    if (!doc) {
      return res.status(404).json({ error: "Document introuvable." });
    }

    if (doc.user_id.toString() !== userId) {
      return res.status(403).json({ error: "Accès interdit." });
    }

    const absolutePath = path.resolve(process.cwd(), '../AI_api', doc.file_path);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (err) {
        console.error("Erreur suppression fichier:", err);
      }
    }

    await docModel.deleteById(documentId);

    res.status(200).json({ message: "Document supprimé." });

  } catch (error) {
    console.error("Erreur suppression:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

export const getDocumentFile = async (req, res) => {
  try {
    const documentId = BigInt(req.params.id);
    const userId = req.userData.userId;

    const doc = await docModel.findById(documentId);

    if (!doc) return res.status(404).json({ error: "Document introuvable." });
    if (doc.user_id.toString() !== userId) return res.status(403).json({ error: "Accès interdit." });

    const absolutePath = path.resolve(process.cwd(), '../AI_api', doc.file_path);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: "Fichier physique introuvable." });
    }

    res.setHeader('Content-Type', 'application/pdf'); 
    res.download(absolutePath, doc.file_name);

  } catch (error) {
    console.error("Erreur téléchargement:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};