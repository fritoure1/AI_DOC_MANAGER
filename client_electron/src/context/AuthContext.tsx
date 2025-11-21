import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';

interface User{
    id: string;
    email: string;
    name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({children}: {children: ReactNode })=>{
    const [user, setUser] = useState<User |null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    const API_URL ='http://localhost:3000/api/auth';

    const login = async (email: string, pass: string) =>{
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email: email,
                password: pass
            });

            const {token, user} = response.data;
            setToken(token);
            setUser(user);

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            console.log("Login réussi ", user);
        
        } catch (error){
            console.error("Erreur login", error);
            throw error;
        }
    }
    const logout = () =>{
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && token){
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return context;
};
