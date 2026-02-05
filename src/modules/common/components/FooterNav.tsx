import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, SHADOWS } from "../constants/theme";

export const FooterNav = () => {
  const router = useRouter();
  const segments = useSegments();
  const currentPath = segments.join("/");

  const isActive = (path: string) => currentPath.includes(path);

  return (
    <View style={styles.footerContainer}>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => router.push("/admin/dashboard" as any)}
      >
        <Ionicons
          name="grid"
          size={22}
          color={isActive("dashboard") ? COLORS.primary : COLORS.grey300}
        />
        <Text
          style={[
            styles.tabText,
            isActive("dashboard") && styles.tabActiveText,
          ]}
        >
          Dashboard
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => router.push("/entregas/lista-entregas" as any)}
      >
        <Ionicons
          name="cube"
          size={22}
          color={isActive("entregas") ? COLORS.primary : COLORS.grey300}
        />
        <Text
          style={[styles.tabText, isActive("entregas") && styles.tabActiveText]}
        >
          Encomendas
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => router.push("/admin/usuario/lista" as any)}
      >
        <Ionicons
          name="people"
          size={22}
          color={isActive("usuario") ? COLORS.primary : COLORS.grey300}
        />
        <Text
          style={[styles.tabText, isActive("usuario") && styles.tabActiveText]}
        >
          Pessoas
        </Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  // ... estilos anteriores ...
  globalBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#1a252f", // Tom mais escuro para contraste
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtn: { padding: 5 },
  menuBtn: { padding: 5 },

  /* FOOTER STYLES */
  footerContainer: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 85 : 65,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
    ...SHADOWS.medium,
  },
  tabItem: { alignItems: "center", justifyContent: "center", flex: 1 },
  tabText: {
    fontSize: 10,
    color: COLORS.grey300,
    marginTop: 4,
    fontWeight: "600",
  },
  tabActiveText: { color: COLORS.primary },
});
