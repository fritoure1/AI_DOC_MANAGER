import prisma from '../database/prisma.js';

export const getUserTags = async (userId) => {
  return await prisma.TAGS.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' }
  });
};


export const createTag = async (userId, tagName) => {
  return await prisma.TAGS.create({
    data: {
      user_id: userId,
      name: tagName
    }
  });
};


export const addTagToDocument = async (documentId, tagId) => {
  return await prisma.DOCUMENT_TAGS.create({
    data: {
      document_id: documentId,
      tag_id: tagId
    }
  });
};