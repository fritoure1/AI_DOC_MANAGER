import prisma from '../database/prisma.js'

export const findAllByUser = async (userId) => {
  return await prisma.DOCUMENTS.findMany({
    where: { 
      user_id: userId 
    },
    orderBy: { 
      created_at: 'desc' 
    },
    include: {
      DOCUMENT_TAGS: {
        include: { TAGS: true }
      },
      _count: {
        select: { DOCUMENT_CHUNKS: true }
      }
    }
  });
};
export const findById = async (docId) => {
  return await prisma.DOCUMENTS.findUnique({
    where: { id: docId }
  });
};

export const deleteById = async (docId) => {
  return await prisma.DOCUMENTS.delete({
    where: { id: docId }
  });
};