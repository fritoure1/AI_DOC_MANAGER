import * as historyModel from '../models/history.model.ts';

const serializeBigInt = (data: any) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

export const getHistory = async (userId: number) => {
  try {
    const history = await historyModel.getUserHistory(userId);
    return serializeBigInt(history);
  } catch (error) {
    console.error("Erreur historique:", error);
    throw new Error("Impossible de récupérer l'historique.");
  }
};