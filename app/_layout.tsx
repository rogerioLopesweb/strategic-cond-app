import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider, useAuthContext } from "../src/context/AuthContext";

// Componente interno para gerenciar a navegação baseada no estado de login
function RootLayoutNav() {
  const { user, loading } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Aguarda o AsyncStorage carregar os dados do João Silva

    // Verifica se o usuário está tentando acessar a tela de login (raiz)
    const isAtLogin = segments.length === 0 || segments[0] === "index";

    if (user && isAtLogin) {
      // Se houver sessão ativa e estiver no Login, pula direto para a Home
      router.replace("/home");
    } else if (!user && !isAtLogin) {
      // Se a sessão sumir (logoff) e não estiver no Login, manda de volta para a raiz
      router.replace("/");
    }
  }, [user, loading, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
      }}
    >
      {/* Tela de Login */}
      <Stack.Screen name="index" />

      {/* Home do Sistema */}
      <Stack.Screen name="home" />

      {/* Telas de Entregas */}
      <Stack.Screen
        name="entregas/lista-entregas"
        options={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />

      <Stack.Screen
        name="entregas/cadastro"
        options={{
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}

// O componente principal apenas envolve o Nav com o Provider
export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootLayoutNav />
    </AuthProvider>
  );
}
