import prisma from '../database/prisma';

export const getUserHistory = async (userId: number | bigint) => {
  return await prisma.sEARCHES.findMany({
    where: {
      user_id: BigInt(userId)
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

export const createSearchEntry = async (userId: number, queryText: string) => {
  return await prisma.sEARCHES.create({
    data: {
      user_id: BigInt(userId),
      query_text: queryText
    }
  });
};

export const saveSearchResults = async (searchId: bigint, results: any[]) => {
  const data = results.map(r => ({
    search_id: searchId,
    chunk_id: BigInt(r.chunk_id),
    score: r.score,
    rank_pos: r.rank
  }));
  
  return await prisma.sEARCH_RESULTS.createMany({
    data: data
  });
};