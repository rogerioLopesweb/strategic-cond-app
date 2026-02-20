import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { IVisitaDTO } from "../types/IVisita";

interface VisitanteCardProps {
  visita: IVisitaDTO;
  onRegistrarSaida: (visitaId: string) => void;
  isLoading?: boolean;
}

export function VisitanteCard({
  visita,
  onRegistrarSaida,
  isLoading,
}: VisitanteCardProps) {
  const isAberta = visita.status === "aberta";

  const handleSaida = () => {
    Alert.alert(
      "Registrar Saída",
      `Deseja registrar a saída de ${visita.nome_visitante}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => onRegistrarSaida(visita.visita_id),
          style: "destructive", // Fica vermelho no iOS
        },
      ],
    );
  };

  return (
    <View style={styles.card}>
      {/* 📸 FOTO / INFO BÁSICA */}
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {visita.nome_visitante.charAt(0)}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{visita.nome_visitante}</Text>
          <Text style={styles.document}>CPF: {visita.cpf_visitante}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{visita.tipo.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* 🏢 DESTINO E STATUS */}
      <View style={styles.detailsRow}>
        <View>
          <Text style={styles.label}>Destino</Text>
          <Text style={styles.value}>
            {visita.bloco
              ? `Bloco ${visita.bloco} - Apto ${visita.unidade}`
              : "Administração"}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={styles.label}>Status</Text>
          <Text
            style={[
              styles.statusText,
              isAberta ? styles.statusAberta : styles.statusFinalizada,
            ]}
          >
            {visita.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* 🚪 BOTÃO DE SAÍDA (Só aparece se estiver aberta) */}
      {isAberta && (
        <TouchableOpacity
          style={styles.button}
          onPress={handleSaida}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Processando..." : "Registrar Saída"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2, // Sombra Android
    shadowColor: "#000", // Sombra iOS
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  header: { flexDirection: "row", alignItems: "center" },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: "bold", color: "#64748B" },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "bold", color: "#1E293B" },
  document: { fontSize: 12, color: "#64748B", marginTop: 2 },
  badge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  badgeText: { fontSize: 10, color: "#0284C7", fontWeight: "bold" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 12 },
  detailsRow: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 12, color: "#94A3B8" },
  value: { fontSize: 14, fontWeight: "500", color: "#334155", marginTop: 2 },
  statusContainer: { alignItems: "flex-end" },
  statusText: { fontSize: 14, fontWeight: "bold", marginTop: 2 },
  statusAberta: { color: "#16A34A" }, // Verde
  statusFinalizada: { color: "#94A3B8" }, // Cinza
  button: {
    marginTop: 16,
    backgroundColor: "#EF4444", // Vermelho
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
});
