import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { COLORS } from "@/src/modules/common/constants/theme";
import { useUnidades } from "@/src/modules/common/hooks/useUnidades";
import { IMoradorUnidade } from "@/src/modules/common/types/unidadeTypes";

interface Props {
  condominioId: string;
  bloco: string;
  unidade: string;
  selecionadoId?: string | null; // ✅ Ajustado para aceitar null
  onSelecionarMorador: (morador: IMoradorUnidade) => void;
}

export const SeletorMoradores = ({
  condominioId,
  bloco,
  unidade,
  selecionadoId, // ✅ Agora extraído corretamente
  onSelecionarMorador,
}: Props) => {
  const { getMoradoresUnidade, loading } = useUnidades();
  const [moradores, setMoradores] = useState<IMoradorUnidade[]>([]);

  useEffect(() => {
    const buscar = async () => {
      if (!condominioId || !bloco || !unidade) return;
      try {
        const dados = (await getMoradoresUnidade(
          condominioId,
          bloco,
          unidade,
        )) as IMoradorUnidade[];
        if (dados && Array.isArray(dados)) {
          const ativos = dados.filter((m) => m.status === true);
          setMoradores(ativos);
        }
      } catch (error) {
        console.error("Erro no SeletorMoradores:", error);
      }
    };
    buscar();
  }, [condominioId, bloco, unidade]);

  if (loading)
    return <ActivityIndicator color={COLORS.primary} style={{ margin: 20 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Selecione quem receberá a entrega:</Text>

      <FlatList
        data={moradores}
        keyExtractor={(item) => item.usuario_id}
        renderItem={({ item }) => {
          const isSelected = item.usuario_id === selecionadoId; // ✅ Verifica seleção

          return (
            <TouchableOpacity
              style={[styles.itemMorador, isSelected && styles.itemSelecionado]}
              onPress={() => {
                // ✅ Proteção contra erro de "is not a function"
                if (typeof onSelecionarMorador === "function") {
                  onSelecionarMorador(item);
                }
              }}
            >
              <View style={styles.info}>
                <Text
                  style={[styles.nome, isSelected && { color: COLORS.primary }]}
                >
                  {item.Nome || "Morador sem nome"}
                </Text>
                <Text style={styles.tipo}>{item.Tipo?.toUpperCase()}</Text>
              </View>
              <Ionicons
                name={isSelected ? "checkmark-circle" : "chevron-forward"}
                size={20}
                color={isSelected ? COLORS.primary : COLORS.grey300}
              />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum morador ativo encontrado.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  titulo: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 10,
  },
  itemMorador: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  itemSelecionado: { borderColor: COLORS.primary, backgroundColor: "#F0F9FF" }, // ✅ Estilo de seleção
  info: { flex: 1 },
  nome: { fontSize: 16, fontWeight: "600", color: COLORS.textMain },
  tipo: { fontSize: 11, color: COLORS.grey300, marginTop: 2 },
  vazio: { textAlign: "center", color: COLORS.grey300, marginTop: 10 },
});
