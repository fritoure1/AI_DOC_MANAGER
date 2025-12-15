import prisma from '../database/prisma';

export const getUserTags = async (userId: number | bigint) => {
  return await prisma.tAGS.findMany({
    where: { user_id: BigInt(userId) },
    orderBy: { created_at: 'desc' }
  });
};

export const createTag = async (userId: number | bigint, tagName: string) => {
  return await prisma.tAGS.create({
    data: {
      user_id: BigInt(userId),
      name: tagName
    }
  });
};

export const addTagToDocument = async (documentId: number | bigint, tagId: number | bigint) => {
  return await prisma.dOCUMENT_TAGS.create({
    data: {
      document_id: BigInt(documentId),
      tag_id: BigInt(tagId)
    }
  });
};