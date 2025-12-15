import * as tagsModel from '../models/tags.model';

const serializeBigInt = (data: any) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

export const getTags = async (userId: number) => {
  try {
    const tags = await tagsModel.getUserTags(userId);
    return serializeBigInt(tags);
  } catch (error) {
    console.error(error);
    throw new Error("Erreur lors de la récupération des tags.");
  }
};

export const createTag = async (data: any) => {
  const { userId, name } = data;
  if (!name) throw new Error("Le nom du tag est requis.");

  try {
    const newTag = await tagsModel.createTag(userId, name);
    return serializeBigInt(newTag);
  } catch (error: any) {
    if (error.code === 'P2002') { 
      throw new Error("Ce tag existe déjà.");
    }
    console.error(error);
    throw new Error("Impossible de créer le tag.");
  }
};

export const linkTag = async (data: any) => {
  const { documentId, tagId } = data;
  if (!documentId || !tagId) throw new Error("IDs requis.");

  try {
    const link = await tagsModel.addTagToDocument(documentId, tagId);
    return serializeBigInt(link);
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error("Ce tag est déjà lié à ce document.");
    }
    throw new Error("Erreur lors de la liaison du tag.");
  }
};