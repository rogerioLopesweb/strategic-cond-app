import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// Chaves consistentes com o que o Interceptor do Axios vai procurar
const USER_KEY = "@StrategicCond:user";
const TOKEN_KEY = "@StrategicCond:token";

interface UserData {
  user_id: string;
  nome: string;
  cpf: string;
  perfil: string;
  condominio: string;
  condominio_id: string;
  token?: string; // Token que vem da API no login
}

interface AuthContextData {
  user: UserData | null;
  loginSession: (data: UserData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  signed: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storageUser = await AsyncStorage.getItem(USER_KEY);
        // O token é gerenciado pelo Interceptor no disco,
        // mas o objeto User mantém a sessão ativa no React.
        if (storageUser) {
          setUser(JSON.parse(storageUser));
        }
      } catch (error) {
        console.error("Erro ao carregar sessão:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStorageData();
  }, []);

  const loginSession = useCallback(async (data: UserData) => {
    try {
      const { token, ...userData } = data; // Separa o token do restante dos dados

      setUser(userData as UserData);

      // Salva o Token em uma chave limpa para o Axios Interceptor
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      }

      // Salva os dados do usuário
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error("Erro ao salvar sessão:", error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Remove tudo para garantir limpeza total
      await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY]);
      setUser(null);
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loginSession,
        logout,
        loading,
        signed: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext deve ser usado dentro de um AuthProvider");
  }
  return context;
};
