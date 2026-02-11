import React, { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Importações do local modular
import { COLORS, SHADOWS, SIZES } from "@/src/modules/common/constants/theme";
import { useAuthContext } from "@/src/modules/common/context/AuthContext";

export default function Login() {
  // ✅ Usando a nova convenção de nomes do contexto
  const { authLogin, authLoginLoading, authLoginError } = useAuthContext();

  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [validacaoErro, setValidacaoErro] = useState("");

  const handleLogin = async () => {
    setValidacaoErro("");

    if (!cpf.trim() || !senha.trim()) {
      setValidacaoErro("* Preencha todos os campos");
      return;
    }

    // ✅ Chamada com o novo nome da função
    const sucesso = await authLogin(cpf, senha);

    if (sucesso) {
      console.log(
        "Login efetuado. O AuthProvider/Sessão cuidará do redirecionamento.",
      );
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/bk-login.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.titulo}>StrategicCond</Text>
          <Text style={styles.subtitulo}>Acesso ao Sistema</Text>

          <TextInput
            placeholder="CPF"
            placeholderTextColor={COLORS.textLight}
            style={[styles.input, validacaoErro && !cpf && styles.inputErro]}
            value={cpf}
            onChangeText={(text) => {
              setCpf(text);
              setValidacaoErro("");
            }}
            keyboardType="numeric"
            editable={!authLoginLoading}
          />

          <TextInput
            placeholder="Senha"
            placeholderTextColor={COLORS.textLight}
            style={[styles.input, validacaoErro && !senha && styles.inputErro]}
            value={senha}
            onChangeText={(text) => {
              setSenha(text);
              setValidacaoErro("");
            }}
            secureTextEntry
            editable={!authLoginLoading}
          />

          {/* Exibição de erros respeitando a nova convenção */}
          {validacaoErro || authLoginError ? (
            <Text style={styles.erroTexto}>
              {validacaoErro || `* ${authLoginError}`}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.botao,
              authLoginLoading && { backgroundColor: COLORS.textLight },
            ]}
            onPress={handleLogin}
            disabled={authLoginLoading}
          >
            {authLoginLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.botaoTexto}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 25,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 30,
    borderRadius: SIZES.radius,
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
    ...SHADOWS.medium,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.primary,
  },
  subtitulo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 30,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    padding: 10,
    fontSize: 16,
    color: COLORS.textMain,
  },
  inputErro: { borderColor: COLORS.error },
  botao: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.radius,
    alignItems: "center",
    marginTop: 10,
    ...Platform.select({
      web: { cursor: "pointer" } as any,
    }),
  },
  botaoTexto: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 18,
  },
  erroTexto: {
    color: COLORS.error,
    textAlign: "left",
    marginBottom: 15,
    fontSize: 13,
    fontWeight: "bold",
  },
});
