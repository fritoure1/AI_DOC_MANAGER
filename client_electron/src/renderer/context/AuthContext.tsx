import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// On définit l'interface User
interface User {
    id: string;
    email: string;
    name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({children}: {children: ReactNode })=>{
    const [user, setUser] = useState<User | null>(null);

    const login = async (email: string, pass: string) =>{
        try {
            const response = await window.electronAPI.auth.login({ email, password: pass });
            
            const userData = response.user; 
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            console.log("Login Electron réussi :", userData);
        
        } catch (error) {
            console.error("Erreur login IPC", error);
            throw error;
        }
    }

    const logout = () =>{
        setUser(null);
        localStorage.removeItem('user');
    }

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser){
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return context;
};