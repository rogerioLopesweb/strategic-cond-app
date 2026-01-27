import { useAuthContext } from "@/src/context/AuthContext";
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

export default function Login() {
  // Agora consumimos TUDO do AuthContext centralizado
  const { login, loginLoading, loginError } = useAuthContext();

  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [validacaoErro, setValidacaoErro] = useState("");

  const handleLogin = async () => {
    setValidacaoErro("");

    if (!cpf.trim() || !senha.trim()) {
      setValidacaoErro("* Preencha todos os campos");
      return;
    }

    // A inteligência agora está no Contexto.
    // Ele faz o fetch, valida a senha, salva no AsyncStorage e define o condomínio ativo.
    const sucesso = await login(cpf, senha);

    if (sucesso) {
      // Nota: Não precisamos dar router.replace aqui!
      // O useEffect do app/_layout.tsx vai notar que 'user' e 'condominioAtivo' mudaram
      // e vai redirecionar automaticamente para /home ou /selecao-condominio.
      console.log(
        "Login efetuado com sucesso, aguardando redirecionamento do layout...",
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
            placeholderTextColor="#7f8c8d"
            style={[styles.input, validacaoErro && !cpf && styles.inputErro]}
            value={cpf}
            onChangeText={(text) => {
              setCpf(text);
              setValidacaoErro("");
            }}
            keyboardType="numeric"
            editable={!loginLoading}
          />

          <TextInput
            placeholder="Senha"
            placeholderTextColor="#7f8c8d"
            style={[styles.input, validacaoErro && !senha && styles.inputErro]}
            value={senha}
            onChangeText={(text) => {
              setSenha(text);
              setValidacaoErro("");
            }}
            secureTextEntry
            editable={!loginLoading}
          />

          {/* Exibe erro de validação local ou erro vindo da API via Contexto */}
          {validacaoErro || loginError ? (
            <Text style={styles.erroTexto}>
              {validacaoErro || `* ${loginError}`}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.botao,
              loginLoading && { backgroundColor: "#7f8c8d" },
            ]}
            onPress={handleLogin}
            disabled={loginLoading}
          >
            {loginLoading ? (
              <ActivityIndicator color="#fff" />
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 25,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 30,
    borderRadius: 15,
    width: "100%",
    maxWidth: 450, // Ajustado para ficar mais elegante na Web
    alignSelf: "center",
    ...Platform.select({
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
    }),
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2c3e50",
  },
  subtitulo: {
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 30,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#bdc3c7",
    marginBottom: 20,
    padding: 10,
    fontSize: 16,
    color: "#2c3e50",
  },
  inputErro: { borderColor: "#e74c3c" },
  botao: {
    backgroundColor: "#34495e",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    ...Platform.select({
      web: { cursor: "pointer" },
    }),
  },
  botaoTexto: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  erroTexto: {
    color: "#e74c3c",
    textAlign: "left",
    marginBottom: 15,
    fontSize: 13,
    fontWeight: "bold",
  },
});
