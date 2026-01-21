import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import Header from "../../src/components/Header";
import { COLORS } from "../../src/constants/theme";
import { useAuthContext } from "../../src/context/AuthContext";
import { useEntregas } from "../../src/hooks/useEntregas";
// Importação do novo componente
import { SeletorMoradores } from "../../src/components/entregas/SeletorMoradores";

export default function CadastroEntrega() {
  const router = useRouter();
  const { user, logout } = useAuthContext(); // Adicionado logout aqui
  const params = useLocalSearchParams();
  const { salvar, loading } = useEntregas();

  // Estados do Formulário
  const [bloco, setBloco] = useState("");
  const [unidade, setUnidade] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [moradorIdReal, setMoradorIdReal] = useState<string | null>(null); // Novo estado
  const [codigo, setCodigo] = useState("");
  const [marketplace, setMarketplace] = useState("Mercado Livre");
  const [urgente, setUrgente] = useState(false);
  const [obs, setObs] = useState("");
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      setBloco(params.bloco as string);
      setUnidade(params.unidade as string);
      setDestinatario(params.morador as string);
      setCodigo(params.codigo as string);
      setMarketplace((params.marketplace as string) || "Amazon");
      setUrgente(params.urgente === "true");
    }
  }, [params]);

  const tirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso à câmera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setFotoBase64(result.assets[0].base64 || null);
    }
  };

  const handleSalvar = async () => {
    const b = bloco.trim();
    const u = unidade.trim();
    const c = codigo.trim();

    if (!b || !u || !c || !moradorIdReal) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha Bloco, Unidade, Código e selecione um morador para continuar.",
      );
      return;
    }

    const payload = {
      condominio_id: user?.condominio_id,
      morador_id: moradorIdReal, // AGORA USA O ID REAL DO COMPONENTE
      codigo_rastreio: c,
      unidade: u,
      bloco: b,
      marketplace,
      observacoes: obs,
      foto_base64: fotoBase64,
    };

    try {
      const result = await salvar(payload);
      if (result.success) {
        Alert.alert("Sucesso", "Encomenda registrada!");
        router.back();
      } else {
        if (result.isAuthError) {
          logout();
          router.replace("/");
        } else {
          Alert.alert("Erro", result.error);
        }
      }
    } catch (err) {
      Alert.alert("Erro", "Falha na conexão com o servidor.");
    }
  };

  return (
    <View style={styles.container}>
      <Header
        titulo={params.id ? "Editar Entrega" : "Novo Recebimento"}
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
              IDENTIFICAÇÃO DA PROPRIEDADE
            </Text>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 0.4 }]}>
                <Text style={styles.label}>BLOCO/TORRE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: A"
                  value={bloco}
                  onChangeText={setBloco}
                  autoCapitalize="characters"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 0.6, marginLeft: 15 }]}>
                <Text style={styles.label}>Nº UNIDADE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 101"
                  value={unidade}
                  onChangeText={setUnidade}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* APLICAÇÃO DO NOVO COMPONENTE DE SELEÇÃO */}
            <SeletorMoradores
              condominioId={user?.condominio_id}
              bloco={bloco}
              unidade={unidade}
              selecionadoId={moradorIdReal}
              onSelecionar={(morador) => {
                // 1. Vincula o ID para a API de salvamento
                setMoradorIdReal(morador.usuario_id);

                // 2. Preenche o campo de texto visualmente
                setDestinatario(morador.Nome || (morador as any).nome);

                // 3. Opcional: Feedback tátil ou log
                console.log("🎯 Morador vinculado:", morador.usuario_id);
              }}
            />

            <Text style={styles.label}>NOME DO DESTINATÁRIO</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Selecione acima ou digite..."
                value={destinatario}
                onChangeText={setDestinatario}
              />
            </View>

            <View style={styles.divider} />

            <Text style={styles.labelSection}>DADOS DA ENCOMENDA</Text>
            <Text style={styles.label}>CÓDIGO DE RASTREIO</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Código ou Scan"
                value={codigo}
                onChangeText={setCodigo}
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
              placeholder="Ex: Pacote amassado..."
              multiline
              value={obs}
              onChangeText={setObs}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.btnSalvar,
              (params.id || urgente) && {
                backgroundColor: urgente ? "#e74c3c" : COLORS.primary,
              },
            ]}
            onPress={handleSalvar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnSalvarTexto}>
                {params.id ? "ATUALIZAR CADASTRO" : "CONFIRMAR RECEBIMENTO"}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    fontSize: 13,
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
    letterSpacing: 0.5,
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
    height: 50,
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
