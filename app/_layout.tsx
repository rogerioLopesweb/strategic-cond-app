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
      /**
       * 🛡️ WHITELIST INTELIGENTE
       * Agora aceitamos rotas que COMEÇAM com o caminho desejado,
       * permitindo que o ID dinâmico passe livremente.
       */
      const isAtMasterAllowed =
        fullPath === "admin/master-hub" ||
        fullPath === "admin/condominio/lista" ||
        fullPath === "admin/condominio/cadastro" ||
        fullPath.startsWith("admin/condominio/editar") || // ✅ Liberado Editar Condomínio
        fullPath.startsWith("admin/usuarios/editar"); // ✅ Liberado Editar Usuário

      // Se não tem prédio selecionado e tenta acessar algo fora da whitelist -> Hub
      if (!authSessao.condominio && !isAtMasterAllowed && !isAtSelecao) {
        console.log(
          "👮 Master Guard: Rota não autorizada para contexto sem condomínio:",
          fullPath,
        );
        router.replace("/admin/master-hub");
      }
      return;
    }

    // 🚀 3. REGRA COMUM: Síndico, Portaria e Morador
    if (authSigned && !authSessao?.isMasterConta) {
      if (!authSessao?.condominio) {
        if (!isAtSelecao) router.replace("/selecao-condominio");
        return;
      }

      if (authSessao.condominio) {
        const perfil = authSessao.condominio.perfil?.toLowerCase() || "";
        const isPerfilAdmin = [
          "sindico",
          "sindica",
          "zelador",
          "administrador",
        ].includes(perfil);

        if (isPerfilAdmin) {
          if (isAtLogin || isAtSelecao || isAtHome) {
            router.replace("/admin/dashboard");
          }
        } else {
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
        <Stack.Screen name="index" />
        <Stack.Screen name="selecao-condominio" />
        <Stack.Screen name="home" />
        {/* Fluxo Master */}
        <Stack.Screen name="admin/master-hub" />
        <Stack.Screen name="admin/condominio/lista" />
        <Stack.Screen name="admin/condominio/cadastro" />
        <Stack.Screen name="admin/condominio/editar/[id]" />{" "}
        {/* ✅ Adicionado aqui */}
        {/* Fluxo Operacional */}
        <Stack.Screen name="admin/dashboard" />
        <Stack.Screen name="admin/usuarios/lista" />
        <Stack.Screen name="admin/usuarios/cadastro" />
        <Stack.Screen name="admin/usuarios/editar/[id]" />{" "}
        {/* ✅ Adicionado aqui */}
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
});
