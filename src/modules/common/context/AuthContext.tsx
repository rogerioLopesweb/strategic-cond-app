import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router"; // ✅ Import necessário para o redirecionamento
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "../services/authService";
import { ICondominio } from "../types/condominioTypes"; // ✅ Importe a oficial
// Chaves para persistência
const USER_KEY = "@StrategicCond:user";
const TOKEN_KEY = "@StrategicCond:token";
const ACTIVE_CONDO_KEY = "@StrategicCond:activeCondo";

export interface IUserData {
  id: string;
  nome: string;
  cpf: string;
  token?: string;
  isMaster: boolean; // ✅ Define acesso ao Hub da Administradora
  perfil?: string;
  conta_id?: string;
  condominios: ICondominio[];
}

export interface IAuthSessao {
  usuario: IUserData;
  condominio: ICondominio | null;
  isMorador: boolean; // 🏠 Toggle para visão do morador (Home/Encomendas)
  isMasterConta: boolean; // 👑 Toggle para visão da Administradora (Hub Global/Financeiro)
}

interface IAuthContextData {
  authSessao: IAuthSessao | null;
  authUser: IUserData | null;
  authLoading: boolean;
  authLoginLoading: boolean;
  authLoginError: string | null;
  authSigned: boolean;
  authLogin: (cpf: string, senha: string) => Promise<boolean>;
  authSelecionarCondominio: (condo: ICondominio) => Promise<void>; // ✅ Recebe o objeto completo
  authLimparCondominio: () => Promise<void>; // ✅ Para o Master voltar ao Hub
  authLogout: () => Promise<void>;
}

const AuthContext = createContext<IAuthContextData>({} as IAuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [user, setUser] = useState<IUserData | null>(null);
  const [condominioAtivo, setCondominioAtivo] = useState<ICondominio | null>(
    null,
  );
  const [authLoading, setAuthLoading] = useState(true);
  const [authLoginLoading, setAuthLoginLoading] = useState(false);
  const [authLoginError, setAuthLoginError] = useState<string | null>(null);

  // ✅ Computed: Sessão Agregada
  const authSessao = useMemo(() => {
    if (!user) return null;

    const perfilAtual = condominioAtivo?.perfil?.toLowerCase() || "";
    const perfisMorador = [
      "morador",
      "proprietario",
      "inquilino",
      "dependente",
    ];

    return {
      usuario: {
        ...user,
        perfil: perfilAtual,
      },
      condominio: condominioAtivo,
      isMorador: perfisMorador.includes(perfilAtual),
      isMasterConta: !!user.isMaster, // ✅ Reflete o poder global do usuário
    };
  }, [user, condominioAtivo]);

  // ✅ Ação: Selecionar Condomínio (Entrar na visão operacional)
  const authSelecionarCondominio = useCallback(
    async (condo: ICondominio) => {
      setCondominioAtivo(condo);
      await AsyncStorage.setItem(ACTIVE_CONDO_KEY, JSON.stringify(condo));

      // Determina o perfil dentro deste condomínio específico
      const perfil = condo.perfil?.toLowerCase() || "";
      const isAdminOuSindico = ["sindico", "administrador", "zelador"].includes(
        perfil,
      );

      if (isAdminOuSindico) {
        router.replace("/admin/dashboard");
      } else {
        // Portaria, Morador ou Proprietário
        router.replace("/home");
      }
    },
    [router],
  );

  // ✅ Ação: Voltar para Master (Limpar contexto do prédio)
  const authLimparCondominio = useCallback(async () => {
    setCondominioAtivo(null);
    await AsyncStorage.removeItem(ACTIVE_CONDO_KEY);
    router.replace("/admin/master-hub"); // 🚀 Volta para a visão geral da Administradora
  }, [router]);

  // ✅ Restauração de Sessão
  useEffect(() => {
    async function loadStorageData() {
      try {
        const [storageUser, storageActive, storageToken] = await Promise.all([
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(ACTIVE_CONDO_KEY),
          AsyncStorage.getItem(TOKEN_KEY),
        ]);

        if (storageUser && storageToken) {
          const parsedUser = JSON.parse(storageUser);
          setUser(parsedUser);
          if (storageActive) setCondominioAtivo(JSON.parse(storageActive));
        }
      } catch (error) {
        console.error("Erro ao carregar sessão:", error);
      } finally {
        setAuthLoading(false);
      }
    }
    loadStorageData();
  }, []);

  // ✅ Ação: Login Refinado
  const authLogin = useCallback(
    async (login: string, senha: string) => {
      setAuthLoginLoading(true);
      setAuthLoginError(null);
      try {
        const res = await authService.login(login, senha);
        console.log("Resposta do login (AuthContext):", res); // Verifique o que está vindo do backend
        if (res.success && res.usuario) {
          const { token, ...userData } = res.usuario;
          if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));

          setUser(userData);

          const totalCondos = userData.condominios?.length ?? 0;

          // 🚀 1. REGRA MASTER: Hub Global sempre
          if (userData.isMaster) {
            router.replace("/admin/master-hub");
            return true;
          }

          // 🚀 2. MÚLTIPLOS CONDOMÍNIOS (Síndico, Portaria, Morador): Vai para Seleção
          if (totalCondos > 1) {
            router.replace("/selecao-condominio");
            return true;
          }

          // 🚀 3. ÚNICO CONDOMÍNIO: Ativa contexto e decide rota pelo perfil
          if (totalCondos === 1) {
            const condoUnico = userData.condominios[0];
            await authSelecionarCondominio(condoUnico);
            // A navegação aqui será feita automaticamente pelo useEffect do RootLayout ou pela authSelecionarCondominio
            return true;
          }

          return true;
        }
        setAuthLoginError(res.error || "Erro ao realizar login");
        return false;
      } catch (err: any) {
        setAuthLoginError(
          err.response?.data?.message || "Servidor indisponível",
        );
        return false;
      } finally {
        setAuthLoginLoading(false);
      }
    },
    [authSelecionarCondominio, router],
  );

  const authLogout = useCallback(async () => {
    await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY, ACTIVE_CONDO_KEY]);
    setUser(null);
    setCondominioAtivo(null);
    router.replace("/home" as any);
  }, [router]);

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
        authLimparCondominio,
        authSigned: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
