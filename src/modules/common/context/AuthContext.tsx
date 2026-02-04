import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "../services/authService";
import { notificationService } from "../services/notificationService";
import { authEvents } from "../utils/authEvents";

// Chaves para persistência
const USER_KEY = "@StrategicCond:user";
const TOKEN_KEY = "@StrategicCond:token";
const ACTIVE_CONDO_KEY = "@StrategicCond:activeCondo";

export interface ICondominio {
  id: string;
  nome: string;
  perfil: string;
}

export interface IUserData {
  id: string;
  nome: string;
  cpf: string;
  token?: string;
  isMaster: boolean; // ✅ Define se tem acesso ao Painel Administradora
  conta_id?: string; // ✅ ID da Conta PJ vinculada
  condominios: ICondominio[];
}

export interface IAuthSessao {
  usuario: IUserData;
  condominio: ICondominio;
  isMorador: boolean;
}

interface IAuthContextData {
  authSessao: IAuthSessao | null;
  authUser: IUserData | null;
  authLoading: boolean;
  authLoginLoading: boolean;
  authLoginError: string | null;
  authSigned: boolean;
  authLogin: (cpf: string, senha: string) => Promise<boolean>;
  authSelecionarCondominio: (id: string) => Promise<void>;
  authLogout: () => Promise<void>;
}

const AuthContext = createContext<IAuthContextData>({} as IAuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUserData | null>(null);
  const [condominioAtivo, setCondominioAtivo] = useState<ICondominio | null>(
    null,
  );
  const [authLoading, setAuthLoading] = useState(true);
  const [authLoginLoading, setAuthLoginLoading] = useState(false);
  const [authLoginError, setAuthLoginError] = useState<string | null>(null);

  // ✅ Computed: Montagem da Sessão Agregada
  const authSessao = useMemo(() => {
    if (!user || !condominioAtivo) return null;

    const perfil = condominioAtivo.perfil.toLowerCase();
    const perfisMorador = [
      "morador",
      "proprietário",
      "proprietario",
      "inquilino",
      "dependente",
    ];

    return {
      usuario: user,
      condominio: condominioAtivo,
      isMorador: perfisMorador.includes(perfil),
    };
  }, [user, condominioAtivo]);

  // ✅ Ouvinte para Logout Forçado
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      setCondominioAtivo(null);
    };
    authEvents.on("forceLogout", handleForceLogout);
    return () => authEvents.off("forceLogout", handleForceLogout);
  }, []);

  // ✅ Efeito: Registro de Push Notifications
  useEffect(() => {
    if (authSessao) {
      const handlePushRegistration = async () => {
        try {
          let token = await notificationService.registerForPushNotifications();
          if (token) await notificationService.updateServerToken(token);
        } catch (error) {
          console.error("Erro push:", error);
        }
      };
      handlePushRegistration();
    }
  }, [authSessao]);

  // ✅ Efeito: Restauração de dados do Storage (Respeitando Regras Master)
  useEffect(() => {
    async function loadStorageData() {
      try {
        const [storageUser, storageActive, storageToken] = await Promise.all([
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(ACTIVE_CONDO_KEY),
          AsyncStorage.getItem(TOKEN_KEY),
        ]);

        if (storageUser && storageToken) {
          const parsedUser: IUserData = JSON.parse(storageUser);
          setUser(parsedUser);

          if (storageActive) {
            setCondominioAtivo(JSON.parse(storageActive));
          }
          // 🚀 AJUSTE: Auto-seleção apenas para usuários comuns com 1 condomínio
          else if (
            parsedUser.condominios?.length === 1 &&
            !parsedUser.isMaster
          ) {
            const unico = parsedUser.condominios[0];
            setCondominioAtivo(unico);
            await AsyncStorage.setItem(ACTIVE_CONDO_KEY, JSON.stringify(unico));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar sessão:", error);
      } finally {
        setAuthLoading(false);
      }
    }
    loadStorageData();
  }, []);

  // ✅ Ação: Login (Respeitando Regras Master)
  const authLogin = useCallback(async (cpf: string, senha: string) => {
    setAuthLoginLoading(true);
    setAuthLoginError(null);
    try {
      const res = await authService.login(cpf, senha);
      if (res.success && res.usuario) {
        const { token, ...userData } = res.usuario;

        if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));

        let activeCondo = null;

        // 🚀 REGRA: Se for Master, nunca auto-seleciona (ele deve escolher no App)
        // Se for usuário comum e tiver só 1, seleciona direto.
        if (userData.condominios?.length === 1 && !userData.isMaster) {
          activeCondo = userData.condominios[0];
          await AsyncStorage.setItem(
            ACTIVE_CONDO_KEY,
            JSON.stringify(activeCondo),
          );
        }

        setCondominioAtivo(activeCondo);
        setUser(userData);
        return true;
      }
      setAuthLoginError(res.error || "Erro ao realizar login");
      return false;
    } catch (err: any) {
      setAuthLoginError(err.response?.data?.message || "Servidor indisponível");
      return false;
    } finally {
      setAuthLoginLoading(false);
    }
  }, []);

  // ✅ Ação: Seleção de Condomínio
  const authSelecionarCondominio = useCallback(
    async (id: string) => {
      const escolhido = user?.condominios.find((c) => c.id === id);
      if (escolhido) {
        setCondominioAtivo(escolhido);
        await AsyncStorage.setItem(ACTIVE_CONDO_KEY, JSON.stringify(escolhido));
      }
    },
    [user],
  );

  // ✅ Ação: Logout
  const authLogout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY, ACTIVE_CONDO_KEY]);
      setUser(null);
      setCondominioAtivo(null);
    } catch (error) {
      console.error("Erro logout:", error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authSessao,
        authUser: user,
        authLoading,
        authLoginLoading,
        authLoginError,
        authLogin,
        authLogout,
        authSelecionarCondominio,
        authSigned: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuthContext must be used within AuthProvider");
  return context;
};
