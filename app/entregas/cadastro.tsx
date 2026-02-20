import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Imports Modulares
import { FeedbackModal } from "@/src/modules/common/components/FeedbackModal";
import { Header } from "@/src/modules/common/components/Header";
import { SeletorMoradores } from "@/src/modules/common/components/SeletorMoradores";
import { COLORS, SHADOWS, SIZES } from "@/src/modules/common/constants/theme";
import { useAuthContext } from "@/src/modules/common/context/AuthContext";
import { IMoradorUnidade } from "@/src/modules/common/types/unidadeTypes";
import { useEntregas } from "@/src/modules/entregas/hooks/useEntregas";

export default function CadastroEntrega() {
  const router = useRouter();
  const { authSessao } = useAuthContext();
  const params = useLocalSearchParams();

  const { registrarEntrega, atualizarEntrega, entregasLoading } = useEntregas();

  const isEditing = params.id && params.editar === "true";

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning" | "confirm";
    title: string;
    message: string;
  }>({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  // Estados do formulário
  const [bloco, setBloco] = useState("");
  const [unidade, setUnidade] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [moradorIdReal, setMoradorIdReal] = useState<string | null>(null);
  const [unidadeIdReal, setUnidadeIdReal] = useState<string | null>(null); // ✅ NOVO: Guarda o ID da Unidade
  const [codigo, setCodigo] = useState("");
  const [marketplace, setMarketplace] = useState("Mercado Livre");
  const [tipoEmbalagem, setTipoEmbalagem] = useState("Pacote");
  const [urgente, setUrgente] = useState(false);
  const [obs, setObs] = useState("");
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      setBloco((params.bloco as string) || "");
      setUnidade((params.unidade as string) || "");
      setDestinatario((params.morador_nome as string) || "");
      setMoradorIdReal((params.morador_id as string) || null);
      setUnidadeIdReal((params.unidade_id as string) || null); // ✅ Recupera na edição se existir
      setCodigo((params.codigo_rastreio as string) || "");
      setMarketplace((params.marketplace as string) || "Mercado Livre");
      setTipoEmbalagem((params.tipo_embalagem as string) || "Pacote");
      setUrgente(params.retirada_urgente === "true");
      setObs((params.observacoes as string) || "");
    }
  }, [isEditing]);

  const mostrarAviso = (type: any, title: string, message: string) => {
    setModalConfig({ visible: true, type, title, message });
  };

  // ✅ LIMPEZA: Se mudar bloco ou unidade, reseta a seleção do morador
  const handleMudarBloco = (texto: string) => {
    setBloco(texto);
    if (!isEditing) {
      setMoradorIdReal(null);
      setUnidadeIdReal(null);
      setDestinatario("");
    }
  };

  const handleMudarUnidade = (texto: string) => {
    setUnidade(texto);
    if (!isEditing) {
      setMoradorIdReal(null);
      setUnidadeIdReal(null);
      setDestinatario("");
    }
  };

  const tirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      mostrarAviso(
        "error",
        "Permissão Negada",
        "Precisamos de acesso à câmera.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled) setFotoBase64(result.assets[0].base64 || null);
  };

  const handleSalvar = async () => {
    if (!bloco.trim() || !unidade.trim() || !moradorIdReal) {
      mostrarAviso(
        "warning",
        "Atenção",
        "Informe Bloco, Unidade e selecione o Morador.",
      );
      return;
    }

    if (!authSessao?.condominio?.id) {
      mostrarAviso("error", "Erro", "Sessão ou Condomínio não identificado.");
      return;
    }

    const payload = {
      id: params.id as string,
      condominio_id: authSessao.condominio.id,
      morador_id: moradorIdReal,
      unidade_id: unidadeIdReal || undefined, // ✅ Enviando o ID da Unidade extraído do Seletor
      codigo_rastreio: codigo.trim(),
      unidade: unidade.trim().toUpperCase(),
      bloco: bloco.trim().toUpperCase(),
      marketplace,
      tipo_embalagem: tipoEmbalagem,
      retirada_urgente: urgente,
      observacoes: obs,
      foto_base64: fotoBase64,
    };

    const result = isEditing
      ? await atualizarEntrega(payload)
      : await registrarEntrega(payload);

    if (result.success) {
      mostrarAviso(
        "success",
        "Sucesso!",
        isEditing ? "Alterações salvas." : "Encomenda registrada!",
      );
    } else {
      mostrarAviso(
        "error",
        "Erro ao salvar",
        result.error || "Tente novamente.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header
        tituloPagina="Cadastro de Encomenda"
        breadcrumb={["Encomendas", "Novo"]}
        showBack={true}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentWrapper}>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.fotoContainer}
                onPress={tirarFoto}
                disabled={entregasLoading}
              >
                {fotoBase64 ? (
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${fotoBase64}` }}
                    style={styles.fotoPreview}
                  />
                ) : (
                  <View style={styles.fotoPlaceholder}>
                    <Ionicons name="camera" size={40} color={COLORS.primary} />
                    <Text style={styles.fotoTexto}>FOTOGRAFAR ETIQUETA</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.labelSection}>
                IDENTIFICAÇÃO {isEditing && "(SOMENTE LEITURA)"}
              </Text>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 0.4 }]}>
                  <Text style={styles.label}>BLOCO</Text>
                  <TextInput
                    style={[styles.input, isEditing && styles.inputDisabled]}
                    value={bloco}
                    onChangeText={handleMudarBloco} // ✅ Atualizado
                    autoCapitalize="characters"
                    editable={!isEditing && !entregasLoading}
                  />
                </View>
                <View
                  style={[styles.inputGroup, { flex: 0.6, marginLeft: 15 }]}
                >
                  <Text style={styles.label}>UNIDADE</Text>
                  <TextInput
                    style={[styles.input, isEditing && styles.inputDisabled]}
                    value={unidade}
                    onChangeText={handleMudarUnidade} // ✅ Atualizado
                    autoCapitalize="characters"
                    editable={!isEditing && !entregasLoading}
                  />
                </View>
              </View>

              {!isEditing && (
                <SeletorMoradores
                  condominioId={authSessao?.condominio?.id!}
                  bloco={bloco}
                  unidade={unidade}
                  selecionadoId={moradorIdReal}
                  titulo="Selecione quem receberá a entrega:"
                  onSelecionarMorador={(m: IMoradorUnidade) => {
                    setMoradorIdReal(m.usuario_id);
                    setUnidadeIdReal(m.unidade_id); // ✅ Capturando a Unidade ID
                    setDestinatario(m.Nome || "Morador Selecionado");
                  }}
                />
              )}

              <Text style={styles.label}>DESTINATÁRIO</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.inputDisabled,
                  { borderBottomColor: "#CCC" },
                ]}
                value={destinatario}
                editable={false}
              />

              <View style={styles.divider} />

              <Text style={styles.labelSection}>DADOS DO VOLUME</Text>

              <Text style={styles.label}>TIPO DE EMBALAGEM</Text>
              <View style={styles.chipsRow}>
                {["Pacote", "Caixa", "Carta", "Outros"].map((tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    style={[
                      styles.chip,
                      tipoEmbalagem === tipo && styles.chipAtivo,
                    ]}
                    onPress={() => setTipoEmbalagem(tipo)}
                    disabled={entregasLoading}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        tipoEmbalagem === tipo && styles.chipTextAtivo,
                      ]}
                    >
                      {tipo.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>MARKETPLACE / ORIGEM</Text>
              <View style={styles.chipsRow}>
                {[
                  "Amazon",
                  "Shopee",
                  "Shein",
                  "Mercado Livre",
                  "Ifood",
                  "Outros",
                ].map((origem) => (
                  <TouchableOpacity
                    key={origem}
                    style={[
                      styles.chip,
                      marketplace === origem && styles.chipAtivo,
                    ]}
                    onPress={() => setMarketplace(origem)}
                    disabled={entregasLoading}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        marketplace === origem && styles.chipTextAtivo,
                      ]}
                    >
                      {origem.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Código de Rastreio"
                  value={codigo}
                  onChangeText={setCodigo}
                  autoCapitalize="characters"
                  editable={!entregasLoading}
                />
                <Ionicons
                  name="barcode-outline"
                  size={24}
                  color={COLORS.secondary}
                />
              </View>

              <View
                style={[
                  styles.urgenteContainer,
                  urgente && { borderColor: COLORS.error },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.label,
                      { color: urgente ? COLORS.error : COLORS.textLight },
                    ]}
                  >
                    RETIRADA URGENTE?
                  </Text>
                  <Text style={styles.subLabel}>
                    Volumes perecíveis ou frágeis
                  </Text>
                </View>
                <Switch
                  value={urgente}
                  onValueChange={setUrgente}
                  trackColor={{ false: COLORS.grey300, true: COLORS.error }}
                  disabled={entregasLoading}
                />
              </View>

              <Text style={styles.label}>OBSERVAÇÕES</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                value={obs}
                onChangeText={setObs}
                editable={!entregasLoading}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.btnSalvar,
                urgente && { backgroundColor: COLORS.error },
                entregasLoading && { opacity: 0.7 },
              ]}
              onPress={handleSalvar}
              disabled={entregasLoading}
            >
              {entregasLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.btnSalvarTexto}>
                  {isEditing ? "SALVAR ALTERAÇÕES" : "CONFIRMAR RECEBIMENTO"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <FeedbackModal
        {...modalConfig}
        onClose={() => {
          setModalConfig((prev) => ({ ...prev, visible: false }));
          if (modalConfig.type === "success")
            router.replace("/entregas/lista-entregas");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  contentWrapper: {
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    padding: 15,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 20,
    ...SHADOWS.medium,
  },
  fotoContainer: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: COLORS.grey100,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  fotoPlaceholder: { alignItems: "center" },
  fotoTexto: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 5,
  },
  fotoPreview: { width: "100%", height: "100%", borderRadius: 12 },
  labelSection: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 15,
    marginTop: 5,
    letterSpacing: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.textLight,
    marginBottom: 5,
  },
  subLabel: { fontSize: 10, color: COLORS.textSecondary },
  row: { flexDirection: "row", marginBottom: 15 },
  inputGroup: { borderBottomWidth: 1.5, borderBottomColor: "#A0A0A0" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#A0A0A0",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: COLORS.textMain,
    fontWeight: "500",
  },
  inputDisabled: {
    color: COLORS.textLight,
    backgroundColor: COLORS.grey100,
    borderBottomColor: COLORS.border,
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 15 },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    marginTop: 5,
  },
  chip: {
    backgroundColor: COLORS.grey100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#B0B0B0",
  },
  chipAtivo: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 10, fontWeight: "bold", color: COLORS.textMain },
  chipTextAtivo: { color: COLORS.white },
  urgenteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ffd7d7",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#A0A0A0",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  btnSalvar: {
    backgroundColor: COLORS.success,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  btnSalvarTexto: { color: COLORS.white, fontWeight: "bold", fontSize: 16 },
});
