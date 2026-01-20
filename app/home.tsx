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
import { COLORS } from "../constants/theme";
import Header from "./components/Header";
import ScannerModal from "./entregas/components/ScannerModal";

// 1. Importar o contexto para acessar o usuário e a função de logout
import { useAuthContext } from "../src/context/AuthContext";

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

  // 2. Consumir a sessão e a função de logout do contexto
  const { user, logout } = useAuthContext();

  const handleSignOut = async () => {
    await logout(); // Limpa o AsyncStorage e a memória
    router.replace("/"); // Redireciona para o Login
  };

  return (
    <View style={styles.container}>
      {/* 3. REVISÃO DO HEADER: 
          Removido o userName fixo. O Header agora buscará user.nome automaticamente do contexto.
      */}
      <Header
        titulo="StrategicCond"
        subtitulo={user?.condominio || "Dashboard Portaria"}
      />

      <ScrollView contentContainerStyle={styles.menuPrincipal}>
        <Text style={styles.labelSessao}>SERVIÇOS DISPONÍVEIS</Text>

        <BotaoAcao
          titulo="Cadastrar Entrega"
          subTitulo="Registrar novo pacote recebido"
          icone="cube-outline"
          cor={COLORS.secondary}
          rota="/entregas/cadastro"
        />

        <BotaoAcao
          titulo="Lista de Encomendas"
          subTitulo="Ver, filtrar e gerenciar entregas"
          icone="list-outline"
          cor={COLORS.primary}
          rota="/entregas/lista-entregas"
        />

        <BotaoAcao
          titulo="Ler QR Code"
          subTitulo="Baixa rápida de saída de pacotes"
          icone="qr-code-outline"
          cor="#e67e22"
          onPress={() => setIsScannerVisible(true)}
        />

        <View style={styles.divider} />
        <Text style={styles.labelSessao}>SISTEMA</Text>

        {/* 4. BOTÃO SAIR: Agora limpa a sessão antes de navegar */}
        <TouchableOpacity style={styles.botaoSair} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
          <Text style={styles.textoSair}>Sair do Aplicativo</Text>
        </TouchableOpacity>
      </ScrollView>

      <ScannerModal
        visible={isScannerVisible}
        onClose={() => setIsScannerVisible(false)}
        titulo="Saída de Encomenda"
      />
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
