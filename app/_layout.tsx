import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { COLORS } from "../src/constants/theme";
import { AuthProvider, useAuthContext } from "../src/context/AuthContext";

function RootLayoutNav() {
  const { user, loading, condominioAtivo } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const isAtLogin = segments.length === 0 || segments[0] === "index";
    const isAtSelecao = segments[0] === "selecao-condominio";

    if (user) {
      // CENÁRIO A: Logado, mas sem condomínio ativo (Multi-condomínio)
      // Se user.condominios não existir ou for vazio, a proteção do AuthContext deve atuar,
      // mas aqui garantimos que ele não fique num limbo.
      if (!condominioAtivo && user.condominios?.length > 1) {
        if (!isAtSelecao) {
          router.replace("/selecao-condominio");
        }
      }
      // CENÁRIO B: Logado e com condomínio definido (ou Seleção concluída)
      else if (condominioAtivo && (isAtLogin || isAtSelecao)) {
        router.replace("/home");
      }
    }
    // CENÁRIO C: Não logado
    else if (!isAtLogin) {
      router.replace("/");
    }
  }, [user, condominioAtivo, loading, segments]);

  return (
    <View style={styles.outerContainer}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === "ios" ? "fade" : "fade_from_bottom",
          // O fundo do conteúdo do Stack segue o tema
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="selecao-condominio" />
        <Stack.Screen name="home" />
        <Stack.Screen name="entregas/lista-entregas" />
        <Stack.Screen name="entregas/cadastro" />
        <Stack.Screen name="admin/home" />
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
