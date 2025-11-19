import * as tagsModel from '../models/tags.model.js'

const serializeBigInt = (data) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

export const getTags = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const tags = await tagsModel.getUserTags(userId);
    res.status(200).json(serializeBigInt(tags));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des tags." });
  }
};

export const createTag = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: "Le nom du tag est requis." });

    const newTag = await tagsModel.createTag(userId, name);
    res.status(201).json(serializeBigInt(newTag));

  } catch (error) {if (error.code === 'P2002') {
      return res.status(409).json({ error: "Ce tag existe déjà pour cet utilisateur." });
    }
    console.error(error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

export const linkTag = async (req, res) => {
  try {
    const { documentId, tagId } = req.body;

    if (!documentId || !tagId) {
      return res.status(400).json({ error: "documentId et tagId requis." });
    }

    const link = await tagsModel.addTagToDocument(documentId, tagId);
    res.status(201).json({ message: "Tag ajouté au document !", link: serializeBigInt(link) });

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: "Ce document a déjà ce tag." });
    }
    console.error(error);
    res.status(500).json({ error: "Erreur serveur lors de la liaison." });
  }
};