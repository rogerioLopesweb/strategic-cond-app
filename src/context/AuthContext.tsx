import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { notificationService } from "../services/notificationService";

const USER_KEY = "@StrategicCond:user";
const TOKEN_KEY = "@StrategicCond:token";

export interface UserData {
  id: string;
  user_id: string;
  nome: string;
  cpf: string;
  perfil: string;
  condominio: string;
  condominio_id: string;
  token?: string;
}

interface AuthContextData {
  user: UserData | null;
  loginSession: (data: UserData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  signed: boolean;
  // NOVIDADE: Helper para simplificar a lógica nas telas
  isMorador: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper para identificar se o perfil logado atua como morador
  // Aceita: 'Proprietário', 'Inquilino', 'Morador', etc.
  const checkIsMorador = useCallback(() => {
    if (!user?.perfil) return false;
    const perfil = user.perfil.toLowerCase();
    const perfisMorador = [
      "morador",
      "proprietário",
      "proprietario",
      "inquilino",
      "dependente",
    ];
    return perfisMorador.includes(perfil);
  }, [user]);

  useEffect(() => {
    if (user) {
      handlePushRegistration();
    }
  }, [user]);

  const handlePushRegistration = async () => {
    try {
      const token = await notificationService.registerForPushNotifications();
      if (token) {
        await notificationService.updateServerToken(token);
      }
    } catch (error) {
      console.error("Erro no fluxo de registro de push:", error);
    }
  };

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storageUser = await AsyncStorage.getItem(USER_KEY);
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
      const { token, ...userData } = data;
      setUser(userData as UserData);

      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      }
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error("Erro ao salvar sessão:", error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
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
        isMorador: checkIsMorador(), // Disponibiliza a validação globalmente
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
