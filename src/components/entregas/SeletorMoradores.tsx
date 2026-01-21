import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthContext } from "../../../src/context/AuthContext";
import { unidadeService } from "../../../src/services/unidadeService";
import { COLORS } from "../../constants/theme";

interface Morador {
  usuario_id: string;
  Nome: string;
  Tipo: string;
}

interface Props {
  condominioId: string | undefined;
  bloco: string;
  unidade: string;
  onSelecionar: (morador: Morador) => void;
  selecionadoId?: string | null;
}

export const SeletorMoradores = ({
  condominioId,
  bloco,
  unidade,
  onSelecionar,
  selecionadoId,
}: Props) => {
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [carregando, setCarregando] = useState(false);
  const { logout } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    const buscar = async () => {
      const b = bloco.trim();
      const u = unidade.trim();

      console.log("🛠️ [Seletor] Estado Atual:", { condominioId, b, u });

      // Só busca se tiver os dados mínimos necessários
      if (condominioId && b.length >= 1 && u.length >= 2) {
        setCarregando(true);

        try {
          console.log(
            `📡 [Seletor] Chamando API para Condomínio: ${condominioId}`,
          );

          const res = await unidadeService.listarMoradoresPorUnidade(
            condominioId,
            b,
            u,
          );

          if (res.success) {
            console.log(
              `✅ [Seletor] Moradores encontrados: ${res.data.length}`,
            );
            setMoradores(res.data);

            // Automação: Se houver apenas 1 morador, já dispara a seleção
            if (res.data.length === 1) {
              onSelecionar(res.data[0]);
            }
          } else {
            setMoradores([]);
            if (res.error === "401") {
              console.warn("⚠️ Sessão expirada. Redirecionando...");
              await logout();
              router.replace("/");
            }
          }
        } catch (error) {
          console.error("💥 Erro no componente Seletor:", error);
        } finally {
          setCarregando(false);
        }
      } else {
        setMoradores([]);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      buscar();
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [bloco, unidade, condominioId]);

  if (carregando) {
    return (
      <View style={styles.loadingArea}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Buscando moradores...</Text>
      </View>
    );
  }

  if (moradores.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Selecione o Destinatário:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
      >
        {moradores.map((item) => {
          // Normalização para evitar erros de Case Sensitivity do Banco
          const nomeExibicao = item.Nome || (item as any).nome || "Morador";
          const tipoExibicao = item.Tipo || (item as any).tipo || "Residente";

          return (
            <TouchableOpacity
              key={item.usuario_id}
              activeOpacity={0.7}
              style={[
                styles.chip,
                selecionadoId === item.usuario_id && styles.chipAtivo,
              ]}
              onPress={() => onSelecionar(item)}
            >
              <Ionicons
                name="person-circle"
                size={18}
                color={
                  selecionadoId === item.usuario_id ? "#fff" : COLORS.primary
                }
              />
              <Text
                style={[
                  styles.text,
                  selecionadoId === item.usuario_id && styles.textAtivo,
                ]}
              >
                {nomeExibicao} ({tipoExibicao})
              </Text>
              {selecionadoId === item.usuario_id && (
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="#fff"
                  style={{ marginLeft: 5 }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 12 },
  titulo: {
    fontSize: 10,
    color: "#95a5a6",
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scroll: { flexDirection: "row" },
  loadingArea: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 8,
    fontWeight: "500",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#D1D8E0",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  chipAtivo: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    elevation: 3,
  },
  text: { fontSize: 13, color: "#333", marginLeft: 6, fontWeight: "500" },
  textAtivo: { color: "#fff", fontWeight: "bold" },
});
