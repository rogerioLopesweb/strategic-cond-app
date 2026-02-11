import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/theme"; // Ajuste o caminho conforme seu projeto

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  loading?: boolean;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}: PaginationProps) => {
  // Se houver apenas 1 página ou nenhuma, não precisa exibir a paginação
  if (totalPages <= 1) return null;

  return (
    <View style={styles.pagination}>
      <TouchableOpacity
        disabled={currentPage === 1 || loading}
        onPress={() => onPageChange(currentPage - 1)}
        style={[
          styles.pageBtn,
          (currentPage === 1 || loading) && styles.disabled,
        ]}
      >
        <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
      </TouchableOpacity>

      <Text style={styles.pageText}>
        Página <Text style={styles.pageNumber}>{currentPage}</Text> de{" "}
        <Text style={styles.pageNumber}>{totalPages}</Text>
      </Text>

      <TouchableOpacity
        disabled={currentPage >= totalPages || loading}
        onPress={() => onPageChange(currentPage + 1)}
        style={[
          styles.pageBtn,
          (currentPage >= totalPages || loading) && styles.disabled,
        ]}
      >
        <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    gap: 20,
  },
  pageBtn: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.primary,
    // Sombra leve para profundidade
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pageText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  pageNumber: {
    fontWeight: "bold", // 👈 Isso faz o negrito
    color: "#333", // Opcional: um tom mais escuro para destacar mais
  },
  disabled: {
    opacity: 0.3,
    borderColor: "#ccc",
  },
});
