import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const splitText = async (text: string): Promise<string[]> => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  
  const documents = await splitter.createDocuments([text]);
  return documents.map(doc => doc.pageContent);
};