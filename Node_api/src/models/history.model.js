import prisma from '../database/prisma.js';

export const getUserHistory = async (userId) => {
  return await prisma.SEARCHES.findMany({
    where: {
      user_id: userId
    },
    orderBy: {
      created_at: 'desc'
    },
    include: {
      SEARCH_RESULTS: {
        include: {
          DOCUMENT_CHUNKS: {
            include: {
              DOCUMENTS: {
                select: { file_name: true }
              }
            }
          }
        },
        orderBy: {
          rank_pos: 'asc'
        }
      }
    },
    take: 20
  });
};