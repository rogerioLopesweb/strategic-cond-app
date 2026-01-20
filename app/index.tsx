import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthContext } from "../src/context/AuthContext";
import { useAuth } from "../src/hooks/useAuth";

export default function Login() {
  const router = useRouter();
  const { login, loading, error: apiError } = useAuth();
  const { loginSession } = useAuthContext();

  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [validacaoErro, setValidacaoErro] = useState("");

  const handleLogin = async () => {
    setValidacaoErro("");

    if (!cpf.trim() || !senha.trim()) {
      setValidacaoErro("* preencha os campos");
      return;
    }

    const result = await login(cpf, senha);

    // DEBUG: Verifique no console do navegador (F12) o que aparece aqui
    console.log("Resposta da API no Login:", result);

    if (result) {
      try {
        /* IMPORTANTE: Verifique se os dados não estão dentro de result.user ou result.data
           Se a API retornar { user: { nome: "..." } }, você deve usar result.user.nome
        */
        await loginSession({
          user_id: result.usuario.id, // Garante compatibilidade se o campo for 'id'
          nome: result.usuario.nome,
          cpf: result.usuario.cpf,
          perfil: result.usuario.perfil,
          condominio: result.usuario.condominio,
          condominio_id: result.usuario.condominio_id,
          token: result.usuario.token,
        });

        router.replace("/home");
      } catch (e) {
        console.error("Erro ao salvar sessão:", e);
        setValidacaoErro("Erro interno ao processar login.");
      }
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
          />

          {validacaoErro || apiError ? (
            <Text style={styles.erroTexto}>
              {validacaoErro || `* ${apiError}`}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[styles.botao, loading && { backgroundColor: "#7f8c8d" }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
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

// Estilos permanecem os mesmos...
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
    maxWidth: 600,
    alignSelf: "center",
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2c3e50",
  },
  subtitulo: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 30,
    textTransform: "uppercase",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#bdc3c7",
    marginBottom: 20,
    padding: 10,
    fontSize: 16,
  },
  inputErro: { borderColor: "#e74c3c" },
  botao: {
    backgroundColor: "#34495e",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  botaoTexto: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  erroTexto: {
    color: "#e74c3c",
    textAlign: "left",
    marginBottom: 15,
    fontSize: 14,
    fontWeight: "bold",
  },
});
