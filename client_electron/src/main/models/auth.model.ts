import prisma from '../database/prisma';
import bcrypt from 'bcryptjs';


export const findUserByEmail = async (email: string) => {
  return await prisma.uSERS.findUnique({
    where: { email: email }
  });
};

export const createUser = async (email: string, password: string, name: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.uSERS.create({
    data: {
      email: email,
      password_hash: hashedPassword,
      name: name
    }
  });
};

export const loginUser = async (email: string, password: string) => {
    const user = await findUserByEmail(email);
    if (!user) {
        throw new Error("Email ou mot de passe incorrect.");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        throw new Error("Email ou mot de passe incorrect.");
    }

    return user;
};