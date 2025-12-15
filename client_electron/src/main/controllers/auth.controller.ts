import * as authModel from '../models/auth.model.js';

export const register = async (data: any) => {
  const { email, password, name } = data;
  if (!email || !password) {
    throw new Error("Email et mot de passe requis." );
  }

  const existingUser = await authModel.findUserByEmail(email);
  if (existingUser) {
    throw new Error("Cet email est déjà pris.");    
  }

  const newUser = await authModel.createUser(email, password, name);

  
  return { 
    id: newUser.id.toString(), 
    email: newUser.email, 
    name: newUser.name 
  };
};

export const login = async (data: any) => {
  const { email, password } = data;
  if (!email || !password) {
    throw new Error("Email et mot de passe requis." );
    }

  const user = await authModel.loginUser(email, password);

  return {
    message: "Connexion réussie !",
    user: {
      id: user.id.toString(),
      email: user.email, 
      name: user.name
    }
  };
};


