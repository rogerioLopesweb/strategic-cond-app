import { ScannerModal } from "@/src/components/entregas/ScannerModal";
import Header from "@/src/components/Header";
import { COLORS } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Importação do contexto revisada
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

  // 1. Consumir isMorador para controle de visibilidade
  const { user, logout, isMorador } = useAuthContext();

  const handleSignOut = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Header
        titulo="StrategicCond"
        subtitulo={
          user?.condominio ||
          (isMorador ? "Minha Residência" : "Dashboard Portaria")
        }
      />

      <ScrollView contentContainerStyle={styles.menuPrincipal}>
        <Text style={styles.labelSessao}>
          {isMorador ? "MINHA ÁREA" : "SERVIÇOS DISPONÍVEIS"}
        </Text>

        {/* 2. BOTÃO CADASTRAR: Escondido para Morador */}
        {!isMorador && (
          <BotaoAcao
            titulo="Cadastrar Entrega"
            subTitulo="Registrar novo pacote recebido"
            icone="cube-outline"
            cor={COLORS.secondary}
            rota="/entregas/cadastro"
          />
        )}

        {/* 3. LISTA DE ENCOMENDAS: Visível para ambos */}
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

        {/* 4. LER QR CODE: Escondido para Morador */}
        {!isMorador && (
          <BotaoAcao
            titulo="Ler QR Code"
            subTitulo="Baixa rápida de saída de pacotes"
            icone="qr-code-outline"
            cor="#e67e22"
            onPress={() => setIsScannerVisible(true)}
          />
        )}

        <View style={styles.divider} />
        <Text style={styles.labelSessao}>SISTEMA</Text>

        <TouchableOpacity style={styles.botaoSair} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
          <Text style={styles.textoSair}>Sair do Aplicativo</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 5. MODAL SCANNER: Só faz sentido existir se não for morador */}
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
  container: { flex: 1, backgroundColor: COLORS.background },
  menuPrincipal: { padding: 20 },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
