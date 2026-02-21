import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Imports do seu projeto
import {
  IMensagemChat,
  useAssistente,
} from "@/src/modules/assistente/hooks/useAssistente";
import { Header } from "@/src/modules/common/components/Header";
import { COLORS } from "@/src/modules/common/constants/theme";
import { useAuthContext } from "@/src/modules/common/context/AuthContext";

export default function ChatScreen() {
  const { authSessao } = useAuthContext();
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const { mensagens, loading, enviarMensagem } = useAssistente();
  const condominioId = authSessao?.condominio?.id;

  const nomeUsuarioLogado = authSessao?.usuario?.nome || "Você";

  const handleSend = () => {
    if (inputText.trim() && condominioId) {
      enviarMensagem(inputText, condominioId);
      setInputText("");
    }
  };

  useEffect(() => {
    if (mensagens.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [mensagens]);

  const renderItem = ({ item }: { item: IMensagemChat }) => {
    const isUsuario = item.remetente === "usuario";
    const isSistema = item.remetente === "sistema";

    const horaFormatada = new Date(item.data_hora).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isSistema) {
      return (
        <View style={styles.sistemaContainer}>
          <Text style={styles.sistemaTexto}>{item.texto}</Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageRow,
          isUsuario ? styles.rowUsuario : styles.rowOtto,
        ]}
      >
        {/* AVATAR DO OTTO (Esquerda) */}
        {!isUsuario && (
          <View style={styles.avatarOtto}>
            <Ionicons name="logo-android" size={18} color={COLORS.white} />
          </View>
        )}

        <View
          style={[
            styles.bubble,
            isUsuario ? styles.bubbleUsuario : styles.bubbleOtto,
          ]}
        >
          {/* HEADER (Nome do Remetente) */}
          <Text
            style={[
              styles.messageName,
              isUsuario ? styles.nameUsuario : styles.nameOtto,
            ]}
          >
            {isUsuario ? nomeUsuarioLogado : "Otto"}
          </Text>

          {/* BODY (Conteúdo da Mensagem) */}
          <Text
            style={[
              styles.messageText,
              isUsuario ? styles.textUsuario : styles.textOtto,
            ]}
          >
            {item.texto}
          </Text>

          {/* FOOTER (Data/Horário) */}
          <Text
            style={[
              styles.timestamp,
              isUsuario ? styles.timestampUsuario : styles.timestampOtto,
            ]}
          >
            {horaFormatada}
          </Text>
        </View>

        {/* AVATAR DO USUÁRIO (Direita) */}
        {isUsuario && (
          <View style={styles.avatarUsuario}>
            {/* Espaço reservado para a futura foto do usuário */}
            <Ionicons name="person" size={16} color={COLORS.primary} />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header tituloPagina="Assistente Virtual Otto 🤖" showBack />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.contentWrapper}>
          <View style={styles.chatArea}>
            <FlatList
              ref={flatListRef}
              data={mensagens}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              onLayout={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="chatbubbles-outline"
                    size={60}
                    color={COLORS.grey300}
                  />
                  <Text style={styles.emptyText}>
                    Olá, {nomeUsuarioLogado.split(" ")[0]}! Eu sou o Otto.{"\n"}
                    Como posso te ajudar hoje?
                  </Text>
                </View>
              }
            />

            {loading && (
              <View style={styles.loadingContainer}>
                <View
                  style={[
                    styles.avatarOtto,
                    { width: 20, height: 20, borderRadius: 10 },
                  ]}
                >
                  <Ionicons
                    name="logo-android"
                    size={12}
                    color={COLORS.white}
                  />
                </View>
                <Text style={styles.loadingText}>Otto está digitando...</Text>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Digite sua mensagem..."
              placeholderTextColor={COLORS.textLight}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || loading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || loading}
            >
              <Ionicons
                name="send"
                size={20}
                color={
                  !inputText.trim() || loading ? COLORS.textLight : COLORS.white
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F4F7",
  },
  contentWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    backgroundColor: "#F2F4F7",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      web: {
        marginVertical: 20,
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
      },
    }),
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 15,
  },
  listContent: {
    paddingVertical: 20,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-end", // Garante que o avatar fique alinhado na parte de baixo do balão
  },
  rowUsuario: {
    justifyContent: "flex-end",
  },
  rowOtto: {
    justifyContent: "flex-start",
  },
  // ✅ Avatares Menores (28x28 em vez de 36x36)
  avatarOtto: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarUsuario: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E2E8F0", // Um fundo neutro enquanto não temos a foto
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  bubble: {
    maxWidth: "75%", // ✅ Reduzido para dar respiro aos avatares
    minWidth: 120,
    padding: 12,
    borderRadius: 18,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  bubbleUsuario: {
    backgroundColor: COLORS.success,
    borderBottomRightRadius: 4,
  },
  bubbleOtto: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
  },
  messageName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
  },
  nameUsuario: {
    color: "rgba(255,255,255,0.85)",
    alignSelf: "flex-end",
  },
  nameOtto: {
    color: COLORS.primary,
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  textUsuario: {
    color: COLORS.white,
  },
  textOtto: {
    color: COLORS.textMain,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 6,
    alignSelf: "flex-end",
  },
  timestampUsuario: {
    color: "rgba(255,255,255,0.8)",
  },
  timestampOtto: {
    color: COLORS.textLight,
  },
  sistemaContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  sistemaTexto: {
    fontSize: 12,
    color: COLORS.error,
    backgroundColor: "#FEE2E2",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.textLight,
    fontSize: 16,
    marginTop: 15,
    lineHeight: 24,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 36, // Alinhado com o novo tamanho do avatar (28 + 8 de margem)
    marginBottom: 15,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginRight: 10,
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.grey100,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 15,
    color: COLORS.textMain,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.grey200,
  },
});
