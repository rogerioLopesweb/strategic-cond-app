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
  const { authSessao, authLoading, authSigned, authUser } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    // 📍 Identificação de Contexto
    const rootSegment = segments[0] as string;
    const isAtLogin =
      !segments[0] || rootSegment === "index" || rootSegment === "(auth)";
    const isAtSelecao = rootSegment === "selecao-condominio";
    const isAtAdminList =
      segments[0] === "admin" && segments[1] === "condominio";

    const temVinculos =
      authUser?.condominios && authUser.condominios.length > 0;

    // 🛡️ 1. SEGURANÇA: Não autenticado e tentando acessar áreas restritas
    if (!authSigned) {
      if (!isAtLogin) router.replace("/");
      return;
    }

    // 🚀 2. REGRA MASTER: Dono da conta SEM vínculos (Direto para Gestão)
    if (authUser?.isMaster && !temVinculos) {
      if (!isAtAdminList) {
        // Ajuste o caminho conforme sua estrutura real de pastas em (admin)
        router.replace("/admin/dashboard");
      }
      return;
    }

    // 🚀 3. REGRA MISTA OU COMUM: Dono com vínculos OU Morador/Zelador
    if (authSigned) {
      // Se ainda não escolheu o condomínio e não está na tela de seleção
      if (!authSessao && !isAtSelecao) {
        router.replace("/selecao-condominio");
      }
      // Se já escolheu o condomínio e tenta voltar pro Login/Seleção
      else if (authSessao && (isAtLogin || isAtSelecao)) {
        // Redireciona para a Home correta baseada no perfil
        router.replace(authSessao.isMorador ? "/home" : "/admin/dashboard");
      }
    }
  }, [authSessao, authSigned, authLoading, segments, authUser]);

  return (
    <View style={styles.outerContainer}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === "ios" ? "fade" : "fade_from_bottom",
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        {/* Telas de Fluxo Inicial */}
        <Stack.Screen name="index" />
        <Stack.Screen name="selecao-condominio" />
        <Stack.Screen name="home" />

        {/* Módulo de Entregas */}
        <Stack.Screen name="entregas/lista-entregas" />
        <Stack.Screen name="entregas/cadastro" />

        {/* Módulo Administrativo (Administradora/Síndico) */}
        <Stack.Screen name="admin/dashboard" />
        <Stack.Screen name="admin/importacao" />
        {/* Adicione a tela de listagem de condomínios da admin se ela existir */}
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
  outerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
