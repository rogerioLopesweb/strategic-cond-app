import { ScannerModal } from "@/src/components/entregas/ScannerModal";
import Header from "@/src/components/Header";
import { COLORS } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuthContext } from "@/src/context/AuthContext";

interface BotaoAcaoProps {
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
}: BotaoAcaoProps) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (rota) {
      router.push(rota as any);
    }
  };

  return (
    <TouchableOpacity
      style={styles.cardAcao}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconeContainer, { backgroundColor: cor }]}>
        <Ionicons name={icone} size={28} color="#fff" />
      </View>
      <View style={styles.textoContainer}>
        <Text style={styles.tituloAcao}>{titulo}</Text>
        <Text style={styles.subTituloAcao}>{subTitulo}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
    </TouchableOpacity>
  );
};

export default function Home() {
  const router = useRouter();
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const { condominioAtivo, user, logout, isMorador } = useAuthContext();

  const handleSignOut = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      {/* O Header fica fora do wrapper para ocupar 100% da largura na Web */}
      <Header
        tituloPagina="Painel de Controle" // Ou "Painel de Controle"
        breadcrumb={[]} // Vazio pois é a raiz
        showBack={false} // Na Home não faz sentido ter botão voltar
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* WRAPPER RESPONSIVO: Limita o conteúdo a 850px e centraliza */}
        <View style={styles.contentWrapper}>
          <Text style={styles.labelSessao}>
            {isMorador ? "MINHA ÁREA" : "SERVIÇOS DISPONÍVEIS"}
          </Text>

          {!isMorador && (
            <BotaoAcao
              titulo="Cadastrar Entrega"
              subTitulo="Registrar novo pacote recebido"
              icone="cube-outline"
              cor={COLORS.secondary}
              rota="/entregas/cadastro"
            />
          )}

          <BotaoAcao
            titulo={isMorador ? "Minhas Encomendas" : "Lista de Encomendas"}
            subTitulo={
              isMorador
                ? "Veja o que chegou para você"
                : "Ver, filtrar e gerenciar entregas"
            }
            icone="list-outline"
            cor={COLORS.primary}
            rota="/entregas/lista-entregas"
          />

          {!isMorador && (
            <BotaoAcao
              titulo="Ler QR Code"
              subTitulo="Baixa rápida de saída de pacotes"
              icone="qr-code-outline"
              cor="#e67e22"
              onPress={() => setIsScannerVisible(true)}
            />
          )}

          {/* BOTÃO ADMIN EXCLUSIVO WEB (Se necessário futuramente) */}
          {Platform.OS === "web" && !isMorador && (
            <BotaoAcao
              titulo="Painel Administrativo"
              subTitulo="Gestão estratégica do condomínio"
              icone="settings-outline"
              cor="#34495e"
              rota="/admin/home"
            />
          )}

          <View style={styles.divider} />
          <Text style={styles.labelSessao}>SISTEMA</Text>

          <TouchableOpacity style={styles.botaoSair} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
            <Text style={styles.textoSair}>Sair do Aplicativo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {!isMorador && (
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Mágica da centralização e largura limitada
  contentWrapper: {
    width: "100%",
    maxWidth: 1350,
    alignSelf: "center",
    padding: 20,
  },
  labelSessao: {
    fontSize: 12,
    fontWeight: "800",
    color: "#95a5a6",
    marginBottom: 15,
    letterSpacing: 1,
    marginLeft: 5,
  },
  cardAcao: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    ...Platform.select({
      web: {
        cursor: "pointer",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      default: {
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
    }),
  },
  iconeContainer: {
    width: 55,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textoContainer: {
    flex: 1,
    marginLeft: 15,
  },
  tituloAcao: { fontSize: 16, fontWeight: "bold", color: "#2c3e50" },
  subTituloAcao: { fontSize: 12, color: "#7f8c8d", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#ecf0f1", marginVertical: 20 },
  botaoSair: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  textoSair: { color: "#e74c3c", fontWeight: "bold", marginLeft: 10 },
});
