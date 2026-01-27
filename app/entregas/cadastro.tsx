import { FeedbackModal } from "@/src/components/common/FeedbackModal";
import { SeletorMoradores } from "@/src/components/entregas/SeletorMoradores";
import Header from "@/src/components/Header";
import { COLORS } from "@/src/constants/theme";
import { useAuthContext } from "@/src/context/AuthContext";
import { entregaService } from "@/src/services/entregaService";
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

export default function CadastroEntrega() {
  const router = useRouter();
  const { condominioAtivo } = useAuthContext();
  const params = useLocalSearchParams();

  const isEditing = params.id && params.editar === "true";
  const [loading, setLoading] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: "success" as "success" | "error" | "warning" | "confirm",
    title: "",
    message: "",
  });

  const [bloco, setBloco] = useState("");
  const [unidade, setUnidade] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [moradorIdReal, setMoradorIdReal] = useState<string | null>(null);
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

  const tirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      mostrarAviso(
        "error",
        "Permissão Negada",
        "Precisamos de acesso à câmera para registrar a etiqueta.",
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
    // Validação de negócio (Agora aceita letras na unidade)
    if (!bloco.trim() || !unidade.trim() || !moradorIdReal) {
      mostrarAviso(
        "warning",
        "Atenção",
        "Informe o Bloco, Unidade e selecione o Morador responsável.",
      );
      return;
    }

    if (!condominioAtivo?.id) {
      mostrarAviso(
        "error",
        "Erro de Contexto",
        "Nenhum condomínio selecionado.",
      );
      return;
    }

    setLoading(true);
    const payload = {
      condominio_id: condominioAtivo.id,
      morador_id: moradorIdReal,
      codigo_rastreio: codigo.trim(),
      unidade: unidade.trim().toUpperCase(), // Normaliza para maiúsculas (ex: 101a -> 101A)
      bloco: bloco.trim().toUpperCase(),
      marketplace,
      tipo_embalagem: tipoEmbalagem,
      retirada_urgente: urgente,
      observacoes: obs,
      foto_base64: fotoBase64,
    };

    try {
      const result = isEditing
        ? await entregaService.atualizar(params.id as string, payload)
        : await entregaService.registrar(payload);

      if (result.success) {
        mostrarAviso(
          "success",
          "Sucesso!",
          isEditing
            ? "Registro atualizado com sucesso."
            : "Encomenda registrada e morador notificado!",
        );
      } else {
        mostrarAviso(
          "error",
          "Erro ao salvar",
          result.error || "Tente novamente.",
        );
      }
    } catch (err) {
      mostrarAviso(
        "error",
        "Falha de Conexão",
        "Não foi possível falar com o servidor.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* O Header fica fora do wrapper para ocupar 100% da largura na Web */}
      <Header
        tituloPagina="Portaria & Encomendas" // Ou "Painel de Controle"
        breadcrumb={["Encomendas", "Cadastro"]} // Vazio pois é a raiz
        showBack={true} // Na Home não faz sentido ter botão voltar
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
                    onChangeText={setBloco}
                    autoCapitalize="characters"
                    placeholder="Ex: A"
                    editable={!isEditing}
                  />
                </View>
                <View
                  style={[styles.inputGroup, { flex: 0.6, marginLeft: 15 }]}
                >
                  <Text style={styles.label}>UNIDADE</Text>
                  <TextInput
                    style={[styles.input, isEditing && styles.inputDisabled]}
                    value={unidade}
                    onChangeText={setUnidade}
                    autoCapitalize="characters"
                    placeholder="Ex: 101-A"
                    // CORREÇÃO: Removido numeric para aceitar letras
                    keyboardType="default"
                    editable={!isEditing}
                  />
                </View>
              </View>

              {!isEditing && (
                <SeletorMoradores
                  condominioId={condominioAtivo?.id}
                  bloco={bloco}
                  unidade={unidade}
                  selecionadoId={moradorIdReal}
                  onSelecionar={(morador) => {
                    setMoradorIdReal(morador.usuario_id);
                    setDestinatario(morador.nome || morador.Nome);
                  }}
                />
              )}

              <Text style={styles.label}>DESTINATÁRIO</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={destinatario}
                editable={false}
                placeholder="Morador será vinculado via seletor"
              />

              <View style={styles.divider} />

              <Text style={styles.labelSection}>DADOS DO VOLUME</Text>

              <Text style={styles.label}>TIPO DE EMBALAGEM</Text>
              <View style={styles.chipRow}>
                {["Pacote", "Caixa", "Carta", "Outros"].map((tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    style={[
                      styles.marketChip,
                      tipoEmbalagem === tipo && styles.marketChipActive,
                    ]}
                    onPress={() => setTipoEmbalagem(tipo)}
                  >
                    <Text
                      style={[
                        styles.marketText,
                        tipoEmbalagem === tipo && styles.marketTextActive,
                      ]}
                    >
                      {tipo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>CÓDIGO DE RASTREIO</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Bipar ou digitar código"
                  value={codigo}
                  onChangeText={setCodigo}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.btnIconInput}>
                  <Ionicons
                    name="barcode-outline"
                    size={24}
                    color={COLORS.secondary}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>MARKETPLACE / ORIGEM</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.marketScroll}
              >
                {[
                  "Mercado Livre",
                  "Amazon",
                  "Shopee",
                  "Shein",
                  "Ifood",
                  "Outros",
                ].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.marketChip,
                      marketplace === item && styles.marketChipActive,
                    ]}
                    onPress={() => setMarketplace(item)}
                  >
                    <Text
                      style={[
                        styles.marketText,
                        marketplace === item && styles.marketTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.urgenteContainer}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.label,
                      {
                        marginBottom: 0,
                        color: urgente ? "#c0392b" : COLORS.textLight,
                      },
                    ]}
                  >
                    RETIRADA URGENTE?
                  </Text>
                  <Text style={styles.subLabel}>
                    Sinalizar volume perecível ou frágil
                  </Text>
                </View>
                <Switch
                  value={urgente}
                  onValueChange={setUrgente}
                  trackColor={{ false: "#ddd", true: "#e74c3c" }}
                />
              </View>

              <Text style={styles.label}>OBSERVAÇÕES ADICIONAIS</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ex: Deixar com o vizinho, caixa amassada, etc."
                multiline
                numberOfLines={3}
                value={obs}
                onChangeText={setObs}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.btnSalvar,
                urgente && { backgroundColor: "#e74c3c" },
                loading && { opacity: 0.7 },
              ]}
              onPress={handleSalvar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
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
          if (modalConfig.type === "success") {
            router.replace("/entregas/lista-entregas");
          }
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
    maxWidth: 1350,
    alignSelf: "center",
    padding: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    ...Platform.select({
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      default: { elevation: 4 },
    }),
  },
  fotoContainer: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 20,
    overflow: "hidden",
  },
  fotoPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  fotoTexto: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 5,
  },
  fotoPreview: { width: "100%", height: "100%", resizeMode: "cover" },
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
  subLabel: { fontSize: 10, color: "#95a5a6" },
  row: { flexDirection: "row", marginBottom: 15 },
  inputGroup: { borderBottomWidth: 1, borderBottomColor: "#eee" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
    color: "#95a5a6",
    backgroundColor: "#f9f9f9",
    borderBottomColor: "transparent",
  },
  btnIconInput: { padding: 5 },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 15 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
  marketScroll: { flexDirection: "row", marginBottom: 20 },
  marketChip: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#eee",
  },
  marketChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  marketText: { fontSize: 11, color: COLORS.textMain },
  marketTextActive: { color: "#fff", fontWeight: "bold" },
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
  textArea: { height: 60, textAlignVertical: "top" },
  btnSalvar: {
    backgroundColor: "#27ae60",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  btnSalvarTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});
