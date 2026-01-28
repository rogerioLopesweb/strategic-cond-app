import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Imports Modulares e Convenção
import { COLORS } from "../../common/constants/theme";
import { useAuthContext } from "../../common/context/AuthContext";
import { unidadeService } from "../../entregas/services/unidadeService";

interface Morador {
  usuario_id: string;
  nome: string;
  tipo: string;
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
  const [entregasLoading, setEntregasLoading] = useState(false);

  // ✅ Usando a convenção de logout para expirar sessão se necessário
  const { authLogout } = useAuthContext();

  useEffect(() => {
    const buscar = async () => {
      const b = bloco.trim();
      const u = unidade.trim();

      // Só busca se tiver os dados mínimos necessários (Bloco >=1 e Unidade >=1)
      if (condominioId && b.length >= 1 && u.length >= 1) {
        setEntregasLoading(true);

        try {
          const res = await unidadeService.listarMoradoresPorUnidade(
            condominioId,
            b,
            u,
          );

          if (res.success) {
            // Normalização: Garante que tratamos os campos independente da caixa do banco
            const dadosNormalizados = res.data.map((m: any) => ({
              usuario_id: m.usuario_id,
              nome: m.nome || m.Nome || "Morador",
              tipo: m.tipo || m.Tipo || "Residente",
            }));

            setMoradores(dadosNormalizados);

            // Automação: Se houver apenas 1 morador, já seleciona automaticamente
            if (dadosNormalizados.length === 1) {
              onSelecionar(dadosNormalizados[0]);
            }
          } else {
            setMoradores([]);
            if (res.error === "401") {
              await authLogout();
            }
          }
        } catch (error) {
          console.error("💥 Erro SeletorMoradores:", error);
        } finally {
          setEntregasLoading(false);
        }
      } else {
        setMoradores([]);
      }
    };

    // Debounce de 600ms para não sobrecarregar a API enquanto digita
    const delayDebounceFn = setTimeout(() => {
      buscar();
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [bloco, unidade, condominioId]);

  if (entregasLoading) {
    return (
      <View style={styles.loadingArea}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Buscando destinatários...</Text>
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
          const isAtivo = selecionadoId === item.usuario_id;

          return (
            <TouchableOpacity
              key={item.usuario_id}
              activeOpacity={0.7}
              style={[styles.chip, isAtivo && styles.chipAtivo]}
              onPress={() => onSelecionar(item)}
            >
              <Ionicons
                name="person-circle"
                size={18}
                color={isAtivo ? COLORS.white : COLORS.primary}
              />
              <Text style={[styles.text, isAtivo && styles.textAtivo]}>
                {item.nome} ({item.tipo})
              </Text>
              {isAtivo && (
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={COLORS.white}
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
    color: COLORS.textLight,
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
    backgroundColor: COLORS.grey100,
    padding: 10,
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 8,
    fontWeight: "600",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipAtivo: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  text: {
    fontSize: 13,
    color: COLORS.textMain,
    marginLeft: 6,
    fontWeight: "500",
  },
  textAtivo: {
    color: COLORS.white,
    fontWeight: "bold",
  },
});
