import prisma from '../database/prisma.js';
import fs from 'fs';
import path from 'path';

const serializeBigInt = (data) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

export const getUserDocuments = async (req, res) => {
  try {
    const userId = req.userData.userId;

    const docs = await prisma.DOCUMENTS.findMany({
      where: { 
        user_id: userId 
      },
      orderBy: { 
        created_at: 'desc' 
      },
      include: {
        DOCUMENT_TAGS: {
          include: {
            TAGS: true
          }
        },
        _count: {
          select: { DOCUMENT_CHUNKS: true }
        }
      }
    });

    const cleanDocs = serializeBigInt(docs);

    res.status(200).json(cleanDocs);

  } catch (error) {
    console.error("Erreur récupération documents:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des documents." });
  }
};

export const getDocumentFile = async (req, res) => {
  try {
    const documentId = BigInt(req.params.id);
    const userId = req.userData.userId;

    const doc = await prisma.DOCUMENTS.findUnique({
      where: { id: documentId }
    });

    if (!doc) {
      return res.status(404).json({ error: "Document introuvable en BDD." });
    }

    const pythonFolder = '../AI_api'; 
    
    const absolutePath = path.resolve(process.cwd(), pythonFolder, doc.file_path);


    if (!fs.existsSync(absolutePath)) {
      console.error("❌ Fichier physique introuvable !");
      return res.status(404).json({ error: "Fichier physique introuvable sur le serveur." });
    }

    res.download(absolutePath, doc.file_name);

  } catch (error) {
    console.error("Erreur téléchargement:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
}