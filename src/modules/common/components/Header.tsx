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

// ✅ Importações modulares
import { COLORS, SHADOWS, SIZES } from "../constants/theme";
import { useAuthContext } from "../context/AuthContext";
import { SideMenu } from "./SideMenu";

interface IHeaderProps {
  tituloPagina: string;
  breadcrumb?: string[];
  showBack?: boolean;
  onPressBack?: () => void; // ✅ Adicionado para resolver o erro de "Cannot find name"
}

export const Header = ({
  tituloPagina,
  breadcrumb,
  showBack,
  onPressBack,
}: IHeaderProps) => {
  const router = useRouter();
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
            {showBack ? (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={onPressBack || (() => router.back())}
              >
                <Ionicons name="arrow-back" size={26} color={COLORS.white} />
              </TouchableOpacity>
            ) : (
              <View style={styles.logoCircle}>
                <Ionicons name="business" size={18} color={COLORS.primary} />
              </View>
            )}

            <View style={{ marginLeft: 10 }}>
              <Text style={styles.brandText}>STRATEGICCOND</Text>
              <Text style={styles.condoText} numberOfLines={1}>
                {authSessao?.condominio?.nome_fantasia || "ADMINISTRADORA"}
              </Text>
            </View>
          </View>

          {/* DIREITA: Menu Hamburguer */}
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => setIsMenuVisible(true)}
          >
            <Ionicons name="menu" size={32} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* PARTE 2: CONTEXTUAL (BARRA AZUL) */}
        <View style={styles.contextBar}>
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>
              {formattedDateTime.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.pageTitle}>{tituloPagina}</Text>
        </View>
      </View>

      <SideMenu
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        onLogout={authLogout}
        authSessao={authSessao}
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
    paddingTop: Platform.OS === "ios" ? 55 : 25,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#2f4255",
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtn: {
    padding: 5,
    marginRight: 5,
  },
  menuBtn: {
    padding: 5,
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
  contextBar: {
    backgroundColor: COLORS.primary,
    paddingTop: 12,
    paddingBottom: 18,
    paddingHorizontal: SIZES.padding,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    ...SHADOWS.medium,
  },
  timeBadge: {
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  timeText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 9,
    fontWeight: "bold",
  },
  pageTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
  },
});
