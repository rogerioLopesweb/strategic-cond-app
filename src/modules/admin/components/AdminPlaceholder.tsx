import { Header } from "@/src/modules/common/components/Header";
import { COLORS } from "@/src/modules/common/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface AdminPlaceholderProps {
  titulo: string;
  breadcrumb: string[];
}

export default function AdminPlaceholder({
  titulo,
  breadcrumb,
}: AdminPlaceholderProps) {
  return (
    <View style={styles.container}>
      <Header tituloPagina={titulo} breadcrumb={breadcrumb} showBack={true} />
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🚧</Text>
          <Text style={styles.title}>{titulo}</Text>
          <Text style={styles.subtitle}>
            Esta funcionalidade está sendo preparada para o StrategicCond.
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>EM BREVE</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  emoji: { fontSize: 40, marginBottom: 15 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textMain,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  badge: {
    backgroundColor: COLORS.grey100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 20,
  },
  badgeText: { fontSize: 10, fontWeight: "800", color: COLORS.primary },
});
