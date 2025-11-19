import axios from 'axios';
import FormData from 'form-data';

const PYTHON_API_URL = 'http://127.0.0.1:5001';

export const upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier envoyé." });
    }


    if (!req.userData || !req.userData.userId) {
        console.error("ERREUR  : User ID manquant dans le token");
        console.error("Contenu de req.userData :", req.userData);
        return res.status(401).json({ error: "Problème d'authentification : ID utilisateur introuvable." });
    }

    const userId = req.userData.userId.toString(); 
    

    const form = new FormData();
    form.append('file', req.file.buffer, req.file.originalname);
    form.append('user_id', userId);

    console.log(`[Node API] Proxying upload to: ${PYTHON_API_URL}/upload`);

    const pythonResponse = await axios.post(`${PYTHON_API_URL}/upload`, form, {
      headers: {
        ...form.getHeaders()
      }
    });

    res.status(pythonResponse.status).json(pythonResponse.data);

  } catch (error) {
    
    if (error.response) {
      console.error("Réponse Python:", error.response.data);
      return res.status(error.response.status).json(error.response.data);
    }
    
    res.status(500).json({ error: "Erreur serveur lors de l'upload." });
  }
};