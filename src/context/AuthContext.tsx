import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authService } from "../services/authService"; // Importando o serviço aqui
import { notificationService } from "../services/notificationService";

const USER_KEY = "@StrategicCond:user";
const TOKEN_KEY = "@StrategicCond:token";
const ACTIVE_CONDO_KEY = "@StrategicCond:activeCondo";

export interface Condominio {
  id: string;
  nome: string;
  perfil: string;
}

export interface UserData {
  id: string;
  nome: string;
  cpf: string;
  token?: string;
  condominios: Condominio[];
}

interface AuthContextData {
  user: UserData | null;
  condominioAtivo: Condominio | null;
  login: (cpf: string, senha: string) => Promise<boolean>; // Função centralizada
  loginLoading: boolean;
  loginError: string | null;
  selecionarCondominio: (id: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  signed: boolean;
  isMorador: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [condominioAtivo, setCondominioAtivo] = useState<Condominio | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const checkIsMorador = useCallback(() => {
    if (!condominioAtivo?.perfil) return false;
    const perfil = condominioAtivo.perfil.toLowerCase();
    const perfisMorador = [
      "morador",
      "proprietário",
      "proprietario",
      "inquilino",
      "dependente",
    ];
    return perfisMorador.includes(perfil);
  }, [condominioAtivo]);

  useEffect(() => {
    if (user && condominioAtivo) {
      handlePushRegistration();
    }
  }, [user, condominioAtivo]);

  const handlePushRegistration = async () => {
    try {
      const token = await notificationService.registerForPushNotifications();
      if (token) await notificationService.updateServerToken(token);
    } catch (error) {
      console.error("Erro no fluxo de registro de push:", error);
    }
  };

  useEffect(() => {
    async function loadStorageData() {
      try {
        const [storageUser, storageActive] = await Promise.all([
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(ACTIVE_CONDO_KEY),
        ]);

        if (storageUser) {
          const parsedUser = JSON.parse(storageUser);
          setUser(parsedUser);
          if (storageActive) {
            setCondominioAtivo(JSON.parse(storageActive));
          } else if (parsedUser.condominios?.length === 1) {
            const unico = parsedUser.condominios[0];
            setCondominioAtivo(unico);
            await AsyncStorage.setItem(ACTIVE_CONDO_KEY, JSON.stringify(unico));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar sessão:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStorageData();
  }, []);

  // Lógica Interna de Sessão (Atômica)
  const loginSession = useCallback(async (data: UserData) => {
    const { token, ...userData } = data;
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));

    let activeCondo = null;
    if (userData.condominios && userData.condominios.length === 1) {
      activeCondo = userData.condominios[0];
      await AsyncStorage.setItem(ACTIVE_CONDO_KEY, JSON.stringify(activeCondo));
    } else {
      await AsyncStorage.removeItem(ACTIVE_CONDO_KEY);
    }

    setCondominioAtivo(activeCondo);
    setUser(userData);
  }, []);

  // FUNÇÃO DE LOGIN UNIFICADA (Substitui o useAuth hook)
  const login = useCallback(
    async (cpf: string, senha: string) => {
      setLoginLoading(true);
      setLoginError(null);
      try {
        const res = await authService.login(cpf, senha);
        if (res.success && res.usuario) {
          await loginSession(res.usuario);
          return true;
        }
        return false;
      } catch (err: any) {
        const message = err.response?.data?.message || "Credenciais inválidas";
        setLoginError(message);
        return false;
      } finally {
        setLoginLoading(false);
      }
    },
    [loginSession],
  );

  const selecionarCondominio = useCallback(
    async (id: string) => {
      const escolhido = user?.condominios.find((c) => c.id === id);
      if (escolhido) {
        setCondominioAtivo(escolhido);
        await AsyncStorage.setItem(ACTIVE_CONDO_KEY, JSON.stringify(escolhido));
      }
    },
    [user],
  );

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY, ACTIVE_CONDO_KEY]);
      setUser(null);
      setCondominioAtivo(null);
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        condominioAtivo,
        login,
        loginLoading,
        loginError,
        selecionarCondominio,
        logout,
        loading,
        signed:
          !!user && (user.condominios?.length > 1 ? true : !!condominioAtivo),
        isMorador: checkIsMorador(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuthContext deve ser usado dentro de um AuthProvider");
  return context;
};
