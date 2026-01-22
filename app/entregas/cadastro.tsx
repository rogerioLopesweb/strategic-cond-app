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
import { FeedbackModal } from "../../src/components/common/FeedbackModal";
import { SeletorMoradores } from "../../src/components/entregas/SeletorMoradores";
import Header from "../../src/components/Header";
import { COLORS } from "../../src/constants/theme";
import { useAuthContext } from "../../src/context/AuthContext";
import { entregaService } from "../../src/services/entregaService";

export default function CadastroEntrega() {
  const router = useRouter();
  const { user } = useAuthContext();
  const params = useLocalSearchParams();

  const isEditing = params.id && params.editar === "true";
  const [loading, setLoading] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: "success" as "success" | "error" | "warning" | "confirm",
    title: "",
    message: "",
  });

  // Estados do Formulário
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

  // Carregamento inicial - Executa apenas uma vez ao montar a tela
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
  }, []); // Dependência vazia garante que não resetará enquanto você digita

  const mostrarAviso = (type: any, title: string, message: string) => {
    setModalConfig({ visible: true, type, title, message });
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
        "Campos Obrigatórios",
        "Bloco, Unidade e Morador são essenciais.",
      );
      return;
    }

    setLoading(true);
    const payload = {
      condominio_id: user?.condominio_id,
      morador_id: moradorIdReal,
      codigo_rastreio: codigo.trim(),
      unidade: unidade.trim(),
      bloco: bloco.trim(),
      marketplace,
      tipo_embalagem: tipoEmbalagem,
      retirada_urgente: urgente,
      observacoes: obs,
      foto_base_64: fotoBase64,
    };

    try {
      const result = isEditing
        ? await entregaService.atualizar(params.id as string, payload)
        : await entregaService.registrar(payload);

      if (result.success) {
        mostrarAviso(
          "success",
          "Tudo Pronto!",
          isEditing ? "Cadastro atualizado!" : "Encomenda registrada!",
        );
      } else {
        mostrarAviso("error", "Ops!", result.error || "Erro ao salvar.");
      }
    } catch (err) {
      mostrarAviso("error", "Erro de Conexão", "Falha na comunicação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        titulo={isEditing ? "Editar Registro" : "Novo Recebimento"}
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
          <View style={styles.card}>
            <TouchableOpacity style={styles.fotoContainer} onPress={tirarFoto}>
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
                  editable={!isEditing} // Travado na edição
                />
              </View>
              <View style={[styles.inputGroup, { flex: 0.6, marginLeft: 15 }]}>
                <Text style={styles.label}>UNIDADE</Text>
                <TextInput
                  style={[styles.input, isEditing && styles.inputDisabled]}
                  value={unidade}
                  onChangeText={setUnidade}
                  keyboardType="numeric"
                  editable={!isEditing} // Travado na edição
                />
              </View>
            </View>

            {!isEditing && (
              <SeletorMoradores
                condominioId={user?.condominio_id}
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
              editable={false} // Sempre travado (vem do seletor ou do banco)
              placeholder="Morador vinculado"
            />

            <View style={styles.divider} />

            <Text style={styles.labelSection}>DADOS DO VOLUME (EDITÁVEL)</Text>

            <Text style={styles.label}>TIPO DE EMBALAGEM</Text>
            <View style={styles.marketScroll}>
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
                placeholder="Código ou Scan"
                value={codigo}
                onChangeText={setCodigo} // Deve funcionar livremente
                editable={true}
              />
              <TouchableOpacity style={styles.btnIconInput}>
                <Ionicons
                  name="barcode-outline"
                  size={24}
                  color={COLORS.secondary}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>MARKETPLACE</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.marketScroll}
            >
              {["Mercado Livre", "Amazon", "Shopee", "Shein", "Outros"].map(
                (item) => (
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
                ),
              )}
            </ScrollView>

            <View style={styles.urgenteContainer}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { marginBottom: 0 }]}>
                  RETIRADA URGENTE?
                </Text>
                <Text style={styles.subLabel}>
                  Sinalizar volume grande ou perecível
                </Text>
              </View>
              <Switch
                value={urgente}
                onValueChange={setUrgente}
                trackColor={{ false: "#ddd", true: "#e74c3c" }}
              />
            </View>

            <Text style={styles.label}>OBSERVAÇÕES</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notas adicionais..."
              multiline
              value={obs}
              onChangeText={setObs} // Deve funcionar livremente
              editable={true}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.btnSalvar,
              (isEditing || urgente) && {
                backgroundColor: urgente ? "#e74c3c" : "#27ae60",
              },
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
  scrollContent: { padding: 15, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    elevation: 4,
  },
  fotoContainer: {
    width: "100%",
    height: 150,
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
  fotoPreview: { width: "100%", height: "100%" },
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
    backgroundColor: "#fcfcfc",
    borderBottomColor: "transparent",
  },
  btnIconInput: { padding: 5 },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 15 },
  marketScroll: { flexDirection: "row", marginBottom: 20 },
  marketChip: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
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
  textArea: {
    height: 60,
    textAlignVertical: "top",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 10,
  },
  btnSalvar: {
    backgroundColor: "#27ae60",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
  },
  btnSalvarTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 1,
  },
});
