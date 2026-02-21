import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Imports Modulares
import { Header } from "@/src/modules/common/components/Header";
import { COLORS, SHADOWS, SIZES } from "@/src/modules/common/constants/theme";
import { useAuthContext } from "@/src/modules/common/context/AuthContext";
import { ScannerModal } from "@/src/modules/entregas/components/ScannerModal";

interface IBotaoAcaoProps {
  titulo: string;
  subTitulo: string;
  icone: keyof typeof Ionicons.glyphMap;
  cor: string;
  rota?: string;
  onPress?: () => void;
  destaque?: boolean; // Nova prop para o botão brilhar
}

const BotaoAcao = ({
  titulo,
  subTitulo,
  icone,
  cor,
  rota,
  onPress,
  destaque,
}: IBotaoAcaoProps) => {
  const router = useRouter();
  const handlePress = () => {
    if (onPress) onPress();
    else if (rota) router.push(rota as any);
  };

  return (
    <TouchableOpacity
      style={[
        styles.cardAcao,
        destaque && { borderColor: cor, borderWidth: 1.5, ...SHADOWS.medium },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconeContainer, { backgroundColor: cor }]}>
        <Ionicons name={icone} size={28} color={COLORS.white} />
      </View>
      <View style={styles.textoContainer}>
        <Text style={[styles.tituloAcao, destaque && { color: cor }]}>
          {titulo}
        </Text>
        <Text style={styles.subTituloAcao}>{subTitulo}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.grey300} />
    </TouchableOpacity>
  );
};

export default function Home() {
  const router = useRouter();
  const [isScannerVisible, setIsScannerVisible] = useState(false);

  // ✅ Consumindo a nova estrutura de sessão e o logout padronizado
  const { authSessao, authLogout } = useAuthContext();

  // ✅ Validação de Poder: Só Admin, Síndico ou Gerente vê o Painel Administrativo
  const isAdminOuSindico = useMemo(() => {
    if (!authSessao) return false;

    const perfil = authSessao?.condominio?.perfil?.toLowerCase() || "";
    const permitidos = [
      "admin",
      "administrador",
      "sindico",
      "síndico",
      "gerente",
    ];

    return permitidos.includes(perfil);
  }, [authSessao]);

  const handleSignOut = async () => {
    await authLogout();
    router.replace("/");
  };

  // Se por algum motivo a sessão cair mas a tela não disparar o redirect do layout imediatamente
  if (!authSessao) return null;

  // 🎨 Cores temáticas para os módulos
  const COR_ASSISTENTE = "#6366F1"; // Indigo/Roxo Tech (Cor de IA)
  const COR_ENTREGAS = "#6b93c1";
  const COR_VISITANTES = "#10B981"; // Verde Esmeralda

  return (
    <View style={styles.container}>
      <Header
        tituloPagina="Painel de Controle"
        breadcrumb={[]}
        showBack={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          {/* ==============================================
              🤖 MÓDULO: ASSISTENTE VIRTUAL (DESTAQUE MÁXIMO)
          ============================================== */}
          <Text style={styles.labelSessao}>INTELIGÊNCIA ARTIFICIAL</Text>
          <BotaoAcao
            titulo="Falar com o Otto"
            subTitulo="Seu assistente virtual inteligente da portaria"
            icone="chatbubbles-outline"
            cor={COR_ASSISTENTE}
            rota="/assistente/chat" // ✅ Caminho para a nova tela
            destaque={true}
          />

          <View style={styles.divider} />

          {/* ==============================================
              📦 MÓDULO: ENTREGAS E ENCOMENDAS
          ============================================== */}
          <Text style={styles.labelSessao}>
            {authSessao.isMorador ? "MINHAS ENCOMENDAS" : "MÓDULO DE ENTREGAS"}
          </Text>

          {!authSessao.isMorador && (
            <BotaoAcao
              titulo="Cadastrar Entrega"
              subTitulo="Registrar novo pacote recebido"
              icone="cube-outline"
              cor={COR_ENTREGAS}
              rota="/entregas/cadastro"
            />
          )}

          <BotaoAcao
            titulo={
              authSessao.isMorador ? "Lista de Pacotes" : "Lista de Encomendas"
            }
            subTitulo={
              authSessao.isMorador
                ? "Veja o que chegou para você"
                : "Ver, filtrar e gerenciar entregas"
            }
            icone="list-outline"
            cor={COR_ENTREGAS}
            rota="/entregas/lista-entregas"
          />

          {!authSessao.isMorador && (
            <BotaoAcao
              titulo="Ler QR Code"
              subTitulo="Baixa rápida de saída de pacotes"
              icone="qr-code-outline"
              cor={COR_ENTREGAS}
              onPress={() => setIsScannerVisible(true)}
            />
          )}

          <View style={styles.divider} />

          {/* ==============================================
              🚶 MÓDULO: VISITANTES E ACESSOS
          ============================================== */}
          <Text style={styles.labelSessao}>
            {authSessao.isMorador ? "MEUS VISITANTES" : "CONTROLE DE ACESSO"}
          </Text>

          {!authSessao.isMorador && (
            <BotaoAcao
              titulo="Registrar Entrada"
              subTitulo="Cadastrar e liberar novo visitante"
              icone="person-add-outline"
              cor={COR_VISITANTES}
              rota="/visitantes/cadastro"
            />
          )}

          <BotaoAcao
            titulo={
              authSessao.isMorador
                ? "Histórico de Visitas"
                : "Lista de Visitantes"
            }
            subTitulo={
              authSessao.isMorador
                ? "Veja quem visitou sua unidade"
                : "Gerenciar quem está dentro do condomínio"
            }
            icone="people-outline"
            cor={COR_VISITANTES}
            rota="/visitantes/lista-visitantes"
          />

          <View style={styles.divider} />

          {/* ==============================================
              ⚙️ MÓDULO: ADMIN E SISTEMA
          ============================================== */}
          {isAdminOuSindico && (
            <Text style={styles.labelSessao}>ADMINISTRAÇÃO</Text>
          )}

          {/* ✅ Botão Admin com Trava de Perfil */}
          {isAdminOuSindico && (
            <BotaoAcao
              titulo="Painel Administrativo"
              subTitulo="Gestão estratégica do condomínio"
              icone="settings-outline"
              cor={COLORS.textMain}
              rota="/admin/dashboard"
            />
          )}

          <TouchableOpacity style={styles.botaoSair} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={styles.textoSair}>Sair do Aplicativo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {!authSessao.isMorador && (
        <ScannerModal
          visible={isScannerVisible}
          onClose={() => setIsScannerVisible(false)}
          titulo="Saída de Encomenda"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1 },
  contentWrapper: {
    width: "100%",
    maxWidth: 1350,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 40,
  },
  labelSessao: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textLight,
    marginBottom: 15,
    marginTop: 10,
    letterSpacing: 1,
    marginLeft: 5,
  },
  cardAcao: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: SIZES.radius,
    marginBottom: 15,
    ...SHADOWS.light,
    ...Platform.select({
      web: { cursor: "pointer" } as any,
    }),
  },
  iconeContainer: {
    width: 55,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textoContainer: { flex: 1, marginLeft: 15 },
  tituloAcao: { fontSize: 16, fontWeight: "bold", color: COLORS.textMain },
  subTituloAcao: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  botaoSair: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    marginTop: 10,
  },
  textoSair: { color: COLORS.error, fontWeight: "bold", marginLeft: 10 },
});
