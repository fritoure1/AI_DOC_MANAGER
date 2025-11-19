import axios from 'axios';

const PYTHON_API_URL = 'http://127.0.0.1:5001';

export const search = async (req, res)=>{
    try{
        const {q}= req.query;
        const userId= req.userData.userId;

        if (!q){
            return res.status(400).json({error: "Le parametre 'q' est manquant."});
        }

        console.log(`[Node API] Proxying search for user ${userId}: "${q}"`);

        const pythonResponse = await axios.get(`${PYTHON_API_URL}/search`, {
            params: {
                q: q,
                user_id: userId
            }
        });

        res.status(200).json(pythonResponse.data);
    
    } catch (error){
        console.error("Erreur lors de la connexion vers l'API python", error.message);
        res.status(500).json({error: "Erreur serveur lors de la recherche."});
    }
}