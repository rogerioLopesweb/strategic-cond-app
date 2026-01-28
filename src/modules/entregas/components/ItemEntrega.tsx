import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

// ✅ Importando do tema centralizado
import { COLORS, SHADOWS, SIZES } from "../../common/constants/theme";

// ✅ Definindo uma interface para o item para evitar o 'any'
interface IItemEntregaProps {
  item: {
    status: string;
    morador_tipo?: string;
    morador_nome?: string;
    bloco: string;
    unidade: string;
    marketplace?: string;
    url_foto_etiqueta?: string;
    data_recebimento: string;
  };
}

export const ItemEntrega = ({ item }: IItemEntregaProps) => {
  // Lógica de cores baseada no status
  const isPendente = item.status === "recebido";
  const isCancelada = item.status === "cancelada";

  const statusColor = isPendente
    ? COLORS.warning
    : isCancelada
      ? COLORS.textLight
      : COLORS.success;

  const statusBg = isPendente
    ? "#fef5e7"
    : isCancelada
      ? COLORS.grey100
      : "#e8f5e9";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {isCancelada ? "CANCELADA" : isPendente ? "PENDENTE" : "ENTREGUE"}
          </Text>
        </View>

        <View style={styles.tipoBadge}>
          <Text style={styles.tipoText}>
            {item.morador_tipo?.toUpperCase() || "MORADOR"}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.infoPrincipal}>
          <Text style={styles.unidade}>
            BLOCO {item.bloco} - UNID. {item.unidade}
          </Text>

          <Text style={styles.nomeMorador} numberOfLines={1}>
            {item.morador_nome || "NOME NÃO INFORMADO"}
          </Text>

          <Text style={styles.marketplace}>{item.marketplace || "Outros"}</Text>
        </View>

        {item.url_foto_etiqueta && (
          <Image
            source={{ uri: item.url_foto_etiqueta }}
            style={styles.foto}
            resizeMode="cover"
          />
        )}
      </View>

      <View style={styles.footer}>
        <Ionicons name="calendar-outline" size={12} color={COLORS.textLight} />
        <Text style={styles.data}>
          {new Date(item.data_recebimento).toLocaleString("pt-BR")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 15,
    marginBottom: 12,
    ...SHADOWS.light,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },
  tipoBadge: {
    backgroundColor: COLORS.grey100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tipoText: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: "800",
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  infoPrincipal: { flex: 1, marginRight: 10 },
  unidade: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textLight,
    letterSpacing: 0.5,
  },
  nomeMorador: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginTop: 2,
    textTransform: "uppercase",
  },
  marketplace: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  foto: {
    width: 65,
    height: 65,
    borderRadius: 8,
    backgroundColor: COLORS.grey100,
  },
  footer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  data: {
    fontSize: 11,
    color: COLORS.textLight,
    marginLeft: 5,
  },
});
