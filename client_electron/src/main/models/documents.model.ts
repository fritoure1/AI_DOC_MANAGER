import prisma from '../database/prisma.ts'

export const findAllByUser = async (userId: bigint | number) => {
  return await prisma.dOCUMENTS.findMany({
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
export const findById = async (docId: bigint | number) => {
  return await prisma.dOCUMENTS.findUnique({
    where: { id: docId }
  });
};

export const deleteById = async (docId: bigint | number) => {
  return await prisma.dOCUMENTS.delete({
    where: { id: docId }
  });
};

export const createDocument = async (userId: number, fileName: string, filePath: string, docType: string) => {
  return await prisma.dOCUMENTS.create({
    data: {
      user_id: BigInt(userId),
      file_name: fileName,
      file_path: filePath,
      doc_type: docType as any
    }
  });
};

export const addMetadata = async (docId: bigint, key: string, value: string) => {
  const valStr = String(value);
  return await prisma.dOCUMENT_METADATA.upsert({
    where: {
      document_id_meta_key: {
        document_id: docId,
        meta_key: key
      }
    },
    update: { meta_value: valStr },
    create: {
      document_id: docId,
      meta_key: key,
      meta_value: valStr
    }
  });
};

export const createChunks = async (docId: bigint, chunks: string[]) => {
  const data = chunks.map((content, index) => ({
    document_id: docId,
    chunk_index: index,
    content: content
  }));

  await prisma.dOCUMENT_CHUNKS.createMany({
    data: data
  });

  return await prisma.dOCUMENT_CHUNKS.findMany({
    where: { document_id: docId },
    select: { id: true, content: true },
    orderBy: { chunk_index: 'asc' }
  });
};

export const findChunksByIds = async (chunkIds: bigint[])=>{
  if (chunkIds.length===0)
    return [];
  return await prisma.dOCUMENT_CHUNKS.findMany({
    where:{
      id: {in: chunkIds}
    },
    include:{
      DOCUMENTS: true
    }
  })
}