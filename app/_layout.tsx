import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { COLORS } from "../src/modules/common/constants/theme";
import {
  AuthProvider,
  useAuthContext,
} from "../src/modules/common/context/AuthContext";

function RootLayoutNav() {
  const { authSessao, authLoading, authSigned } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    const rootSegment = segments[0];
    const fullPath = segments.join("/");

    // 📍 Identificação de Contexto
    const isAtLogin =
      (segments as string[]).length === 0 ||
      (rootSegment as any) === "(auth)" ||
      (rootSegment as any) === "index";

    const isAtMasterHub = fullPath === "admin/master-hub";
    const isAtSelecao = fullPath === "selecao-condominio";
    const isAtHome = fullPath === "home";
    const isAtAdminArea = rootSegment === "admin";

    // 🛡️ 1. SEGURANÇA: Não autenticado -> Login
    if (!authSigned) {
      if (!isAtLogin) router.replace("/");
      return;
    }

    // 🚀 2. REGRA MASTER: Administradora Global
    if (authSessao?.isMasterConta) {
      const pathsMasterLiberados = [
        "admin/master-hub",
        "admin/condominio/lista",
        "admin/condominio/cadastro",
      ];
      const isAtMasterAllowed = pathsMasterLiberados.includes(fullPath);

      // Se não tem prédio selecionado e não está em telas liberadas -> Hub
      if (!authSessao.condominio && !isAtMasterAllowed && !isAtSelecao) {
        router.replace("/admin/master-hub");
      }
      return; // Master encerra aqui sua lógica
    }

    // 🚀 3. REGRA COMUM: Síndico, Portaria e Morador (isMasterConta: false)
    if (authSigned && !authSessao?.isMasterConta) {
      // 🚩 CASO A: Ainda não escolheu o prédio (ou clicou em Trocar)
      if (!authSessao?.condominio) {
        if (!isAtSelecao) {
          router.replace("/selecao-condominio");
        }
        return;
      }

      // 🚩 CASO B: Já escolheu o prédio -> Definir destino por perfil
      if (authSessao.condominio) {
        const perfil = authSessao.condominio.perfil?.toLowerCase() || "";
        // Síndico e Zelador vão para o Admin/Dashboard
        const isPerfilAdmin = [
          "sindico",
          "sindica",
          "zelador",
          "administrador",
        ].includes(perfil);

        if (isPerfilAdmin) {
          // Se o Síndico estiver no Login, Seleção ou na Home errada -> Dashboard
          if (isAtLogin || isAtSelecao || isAtHome) {
            router.replace("/admin/dashboard");
          }
        } else {
          // Portaria, Morador e Proprietário vão para a Home
          if (isAtLogin || isAtSelecao || isAtAdminArea) {
            router.replace("/home");
          }
        }
      }
    }
  }, [authSessao, authSigned, authLoading, segments]);

  return (
    <View style={styles.outerContainer}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === "ios" ? "fade" : "fade_from_bottom",
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        {/* Telas de Entrada e Seleção */}
        <Stack.Screen name="index" />
        <Stack.Screen name="selecao-condominio" />
        <Stack.Screen name="home" />

        {/* Fluxo Master (Administradora) */}
        <Stack.Screen name="admin/master-hub" />
        <Stack.Screen name="admin/condominio/lista" />
        <Stack.Screen name="admin/condominio/cadastro" />

        {/* Fluxo Operacional (Condomínio Específico) */}
        <Stack.Screen name="admin/dashboard" />
        <Stack.Screen name="admin/usuarios/lista" />
        <Stack.Screen name="admin/usuarios/cadastro" />

        {/* Módulo de Entregas */}
        <Stack.Screen name="entregas/lista-entregas" />
        <Stack.Screen name="entregas/cadastro" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
});
