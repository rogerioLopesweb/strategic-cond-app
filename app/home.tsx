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
import { Header } from "../src/modules/common/components/Header";
import { COLORS, SHADOWS, SIZES } from "../src/modules/common/constants/theme";
import { useAuthContext } from "../src/modules/common/context/AuthContext";
import { ScannerModal } from "../src/modules/entregas/components/ScannerModal";

interface IBotaoAcaoProps {
  titulo: string;
  subTitulo: string;
  icone: keyof typeof Ionicons.glyphMap;
  cor: string;
  rota?: string;
  onPress?: () => void;
}

const BotaoAcao = ({
  titulo,
  subTitulo,
  icone,
  cor,
  rota,
  onPress,
}: IBotaoAcaoProps) => {
  const router = useRouter();
  const handlePress = () => {
    if (onPress) onPress();
    else if (rota) router.push(rota as any);
  };

  return (
    <TouchableOpacity
      style={styles.cardAcao}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconeContainer, { backgroundColor: cor }]}>
        <Ionicons name={icone} size={28} color={COLORS.white} />
      </View>
      <View style={styles.textoContainer}>
        <Text style={styles.tituloAcao}>{titulo}</Text>
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

    const perfil = authSessao.condominio.perfil?.toLowerCase() || "";
    const cargo = authSessao.usuario.cargo?.toLowerCase() || "";
    const permitidos = [
      "admin",
      "administrador",
      "sindico",
      "síndico",
      "gerente",
    ];

    return permitidos.includes(perfil) || permitidos.includes(cargo);
  }, [authSessao]);

  const handleSignOut = async () => {
    await authLogout();
    router.replace("/");
  };

  // Se por algum motivo a sessão cair mas a tela não disparar o redirect do layout imediatamente
  if (!authSessao) return null;

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
          <Text style={styles.labelSessao}>
            {authSessao.isMorador ? "MINHA ÁREA" : "SERVIÇOS DISPONÍVEIS"}
          </Text>

          {!authSessao.isMorador && (
            <BotaoAcao
              titulo="Cadastrar Entrega"
              subTitulo="Registrar novo pacote recebido"
              icone="cube-outline"
              cor={COLORS.secondary}
              rota="/entregas/cadastro"
            />
          )}

          <BotaoAcao
            titulo={
              authSessao.isMorador ? "Minhas Encomendas" : "Lista de Encomendas"
            }
            subTitulo={
              authSessao.isMorador
                ? "Veja o que chegou para você"
                : "Ver, filtrar e gerenciar entregas"
            }
            icone="list-outline"
            cor={COLORS.primary}
            rota="/entregas/lista-entregas"
          />

          {!authSessao.isMorador && (
            <BotaoAcao
              titulo="Ler QR Code"
              subTitulo="Baixa rápida de saída de pacotes"
              icone="qr-code-outline"
              cor="#e67e22"
              onPress={() => setIsScannerVisible(true)}
            />
          )}

          {/* ✅ Botão Admin com Trava de Perfil */}
          {isAdminOuSindico && (
            <BotaoAcao
              titulo="Painel Administrativo"
              subTitulo="Gestão estratégica do condomínio"
              icone="settings-outline"
              cor={COLORS.primary}
              rota="/admin/dashboard"
            />
          )}

          <View style={styles.divider} />
          <Text style={styles.labelSessao}>SISTEMA</Text>

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
  },
  labelSessao: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textLight,
    marginBottom: 15,
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
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 20 },
  botaoSair: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  textoSair: { color: COLORS.error, fontWeight: "bold", marginLeft: 10 },
});
