import prisma from '../database/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const findUserByEmail = async (email) => {
  return await prisma.USERS.findUnique({
    where: { email: email }
  });
};

export const createUser = async (email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.USERS.create({
    data: {
      email: email,
      password_hash: hashedPassword
    }
  });
};

export const loginUser = async (email, password)=> {
    const user = await findUserByEmail(email);
    if(!user){
        throw new Error ("Email ou mot de passe incorrect.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if(!isPasswordValid){
        throw new Error("Email ou mot de passe incorrect.")
    }

    const token = jwt.sign(
        { userId: user.id.toString(), email: user.email},
        process.env.JWT_SECRET,
        {expiresIn: "24h"}
    );
    return { token, user};
};