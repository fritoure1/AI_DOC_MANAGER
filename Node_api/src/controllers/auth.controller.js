import * as authModel from '../models/auth.model.js';

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis." });
    }

    const existingUser = await authModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "Cet email est déjà pris." });
    }

    const newUser = await authModel.createUser(email, password, name);
    res.status(201).json({ id: newUser.id.toString(), email: newUser.email, name: newUser.name });

  } 
  catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis." });
    }

    const { token, user } = await authModel.loginUser(email, password);

    res.status(200).json({
      message: "Connexion réussie !",
      token: token,
      user: {
        id: user.id.toString(),
        email: user.email, name: user.name
      }
    });

  } catch (error) {
    if (error.message === "Email ou mot de passe incorrect.") {
      return res.status(401).json({ error: error.message });
    }
    console.error("Erreur lors du login:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};


