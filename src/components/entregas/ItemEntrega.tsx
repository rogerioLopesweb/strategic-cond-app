import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants/theme";

export const ItemEntrega = ({ item }: { item: any }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>

        {/* Badge para o Tipo do Morador (Proprietário, Morador, etc) */}
        <View style={styles.tipoBadge}>
          <Text style={styles.tipoText}>
            {item.morador_tipo?.toUpperCase() || "VISITANTE"}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.infoPrincipal}>
          <Text style={styles.unidade}>
            {item.bloco} - {item.unidade}
          </Text>

          {/* Nome do Morador em destaque no lugar do rastreio */}
          <Text style={styles.nomeMorador} numberOfLines={1}>
            {item.morador_nome || "NOME NÃO INFORMADO"}
          </Text>

          <Text style={styles.marketplace}>{item.marketplace || "Outros"}</Text>
        </View>

        {item.url_foto_etiqueta && (
          <Image source={{ uri: item.url_foto_etiqueta }} style={styles.foto} />
        )}
      </View>

      <View style={styles.footer}>
        <Ionicons name="calendar-outline" size={12} color="#999" />
        <Text style={styles.data}>
          {new Date(item.data_recebimento).toLocaleString("pt-BR")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: { fontSize: 9, color: "#2e7d32", fontWeight: "bold" },
  tipoBadge: {
    backgroundColor: "#E8F0FE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tipoText: { fontSize: 9, color: COLORS.primary, fontWeight: "bold" },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoPrincipal: { flex: 1 },
  unidade: { fontSize: 18, fontWeight: "bold", color: COLORS.primary },
  nomeMorador: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 2,
    textTransform: "uppercase",
  },
  marketplace: { fontSize: 13, color: "#7f8c8d", marginTop: 2 },
  foto: { width: 55, height: 55, borderRadius: 8, backgroundColor: "#f0f0f0" },
  footer: {
    marginTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#eee",
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  data: { fontSize: 11, color: "#999", marginLeft: 5 },
});
