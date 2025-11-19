import * as historyModel from '../models/history.model.js';

const serializeBigInt = (data) => {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

export const getHistory = async (req, res) => {
  try {
    const userId = req.userData.userId;

    const history = await historyModel.getUserHistory(userId);

    const cleanHistory = serializeBigInt(history);
    
    res.status(200).json(cleanHistory);

  } catch (error) {
    console.error("Erreur historique:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};