import { useAuthContext } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants/theme";
import SideMenu from "./SideMenu";

interface HeaderProps {
  tituloPagina: string;
  breadcrumb?: string[];
  showBack?: boolean;
}

export default function Header({
  tituloPagina,
  breadcrumb,
  showBack,
}: HeaderProps) {
  const router = useRouter();
  const { user, logout, condominioAtivo } = useAuthContext();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDateTime =
    currentTime
      .toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
      .replace(".", "") +
    ` • ${currentTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <>
      <View style={styles.headerWrapper}>
        {/* PARTE 1: GLOBAL (BARRA ESCURA) */}
        <View style={styles.globalBar}>
          <View style={styles.leftGroup}>
            <TouchableOpacity
              style={styles.menuBtn}
              onPress={() =>
                showBack ? router.back() : setIsMenuVisible(true)
              }
            >
              <Ionicons
                name={showBack ? "arrow-back" : "menu"}
                size={28}
                color="#fff"
              />
            </TouchableOpacity>
            <View>
              <Text style={styles.brandText}>STRATEGICCOND</Text>
              <Text style={styles.condoText} numberOfLines={1}>
                {condominioAtivo?.nome || "Condomínio"}
              </Text>
            </View>
          </View>

          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>
              {formattedDateTime.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* PARTE 2: CONTEXTUAL (BARRA AZUL COM CURVA) */}
        <View style={styles.contextBar}>
          {breadcrumb && breadcrumb.length > 0 && (
            <View style={styles.breadcrumbRow}>
              {breadcrumb.map((item, index) => (
                <React.Fragment key={index}>
                  <Text style={styles.breadcrumbText}>
                    {item.toUpperCase()}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={10}
                    color="rgba(255,255,255,0.3)"
                  />
                </React.Fragment>
              ))}
            </View>
          )}
          <Text style={styles.pageTitle}>{tituloPagina}</Text>
        </View>
      </View>

      {/* CHAMADA DO SIDEMENU COM PARÂMETROS AGRUPADOS */}
      <SideMenu
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        onLogout={logout}
        userData={{ user, condominioAtivo }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    zIndex: 10,
    backgroundColor: "transparent", // Fundo da Parte 1 (Essencial para a curva da Parte 2 funcionar)
  },
  globalBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 55 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#2c3e50",
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuBtn: {
    marginRight: 12,
    padding: 4,
  },
  brandText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  condoText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  timeBadge: {
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  contextBar: {
    backgroundColor: COLORS.primary, // Cor azul principal (Parte 2)
    paddingTop: 15,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    alignItems: "center",
    // Sombra para dar o efeito de profundidade sobre a página
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  breadcrumbRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  breadcrumbText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "bold",
    marginHorizontal: 4,
  },
  pageTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
  },
});
