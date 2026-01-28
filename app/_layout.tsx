import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";

// ✅ Importações ajustadas para a nova estrutura modular
import { COLORS } from "../src/modules/common/constants/theme";
import {
  AuthProvider,
  useAuthContext,
} from "../src/modules/common/context/AuthContext";

function RootLayoutNav() {
  // ✅ Agora consumimos estritamente sob a nova convenção
  const { authSessao, authLoading, authSigned } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    // Identificação de onde o usuário está
    const isAtLogin =
      !segments[0] || segments[0] === "index" || segments[0] === "(auth)";
    const isAtSelecao = segments[0] === "selecao-condominio";

    if (authSigned) {
      // REGRA 1: Autenticado mas sem condomínio ativo (authSessao nulo)
      // Se não estiver na tela de seleção, força a ida para lá.
      if (!authSessao && !isAtSelecao) {
        router.replace("/selecao-condominio");
      }
      // REGRA 2: Sessão completa (Usuário + Condomínio)
      // Se tentar voltar pro Login ou Seleção, manda para a Home.
      else if (authSessao && (isAtLogin || isAtSelecao)) {
        router.replace("/home");
      }
    }
    // REGRA 3: Não autenticado e tentando acessar áreas restritas
    else if (!isAtLogin) {
      router.replace("/");
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

        <Stack.Screen name="entregas/lista-entregas" />
        <Stack.Screen name="entregas/cadastro" />

        <Stack.Screen name="admin/dashboard" />
        <Stack.Screen name="admin/importacao" />
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
