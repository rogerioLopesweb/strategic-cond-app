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

// ✅ Novos caminhos modulares e constantes
import { COLORS, SHADOWS, SIZES } from "../constants/theme";
import { useAuthContext } from "../context/AuthContext";
import { SideMenu } from "./SideMenu";

interface IHeaderProps {
  tituloPagina: string;
  breadcrumb?: string[];
  showBack?: boolean;
}

export const Header = ({
  tituloPagina,
  breadcrumb,
  showBack,
}: IHeaderProps) => {
  const router = useRouter();

  // ✅ Consumindo a nova estrutura de Sessão e Logout padronizado
  const { authSessao, authLogout } = useAuthContext();

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
                color={COLORS.white}
              />
            </TouchableOpacity>
            <View>
              <Text style={styles.brandText}>StrategicCond</Text>
              <Text style={styles.condoText} numberOfLines={1}>
                {/* ✅ Nome vindo da Sessão Agregada */}
                {authSessao?.condominio.nome || "Condomínio"}
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
                  {index < breadcrumb.length - 1 && (
                    <Ionicons
                      name="chevron-forward"
                      size={10}
                      color="rgba(255,255,255,0.3)"
                    />
                  )}
                </React.Fragment>
              ))}
            </View>
          )}
          <Text style={styles.pageTitle}>{tituloPagina}</Text>
        </View>
      </View>

      <SideMenu
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        onLogout={authLogout} // ✅ Ação padronizada
        authSessao={authSessao} // ✅ Passando a sessão completa
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    zIndex: 10,
    backgroundColor: "transparent",
  },
  globalBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 55 : 20,
    paddingBottom: 12,
    paddingHorizontal: SIZES.padding,
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
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },
  timeBadge: {
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radius,
  },
  timeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "800",
  },
  contextBar: {
    backgroundColor: COLORS.primary,
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: SIZES.padding,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    alignItems: "center",
    ...SHADOWS.medium,
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
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
  },
});
