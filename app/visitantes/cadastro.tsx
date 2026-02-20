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
import { useVisitantes } from "@/src/modules/visitantes/hooks/useVisitantes";
import { IRegistrarEntradaDataDTO } from "@/src/modules/visitantes/types/IVisita";

export default function CadastroVisitante() {
  const router = useRouter();
  const { authSessao } = useAuthContext();
  const params = useLocalSearchParams();

  // 🪝 Hook de visitantes com a nova função
  const { registrarEntrada, buscarVisitantePorCpf, loading } = useVisitantes();

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
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [tipoPadrao, setTipoPadrao] = useState<
    "visitante" | "prestador" | "corretor"
  >("visitante");
  const [bloco, setBloco] = useState("");
  const [unidade, setUnidade] = useState("");
  const [moradorDestinoId, setMoradorDestinoId] = useState<string | null>(null);
  const [unidadeDestinoId, setUnidadeDestinoId] = useState<string | null>(null);

  const [placaVeiculo, setPlacaVeiculo] = useState("");
  const [empresaPrestadora, setEmpresaPrestadora] = useState("");
  const [obs, setObs] = useState("");
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);

  // Toggle para saber se a visita é na Administração
  const [visitaAdministracao, setVisitaAdministracao] = useState(false);

  // 🔄 Estados para o Auto-preenchimento
  const [buscandoCpf, setBuscandoCpf] = useState(false);
  const [visitanteJaCadastrado, setVisitanteJaCadastrado] = useState(false);

  // ✅ LISTAS DE SUGESTÕES RÁPIDAS
  const SUGESTOES_EMPRESAS = [
    "Vivo",
    "Claro Net",
    "Sabesp",
    "Enel",
    "Comgás",
    "Correios",
    "Ifood",
  ];

  const SUGESTOES_MOTIVOS = [
    "Mudança",
    "Entrega de móveis",
    "Reforma",
    "Manut. Elevador",
    "Manut. Elétrica",
    "Manut. Hidráulica",
    "Manut. Gás",
    "Manut. Piscina",
    "Visita Técnica",
  ];

  const mostrarAviso = (type: any, title: string, message: string) => {
    setModalConfig({ visible: true, type, title, message });
  };

  // 📸 Captura de Foto
  const tirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      mostrarAviso(
        "error",
        "Permissão Negada",
        "Precisamos de acesso à câmera para fotografar o visitante.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled) {
      setFotoBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  // 🎭 MÁSCARA VISUAL DE CPF
  const handleCpfChange = (texto: string) => {
    let limpo = texto.replace(/\D/g, "");
    if (limpo.length > 11) limpo = limpo.substring(0, 11);

    let formatado = limpo;
    formatado = formatado.replace(/(\d{3})(\d)/, "$1.$2");
    formatado = formatado.replace(/(\d{3})(\d)/, "$1.$2");
    formatado = formatado.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    setCpf(formatado);
  };

  // 🧠 EFEITO INTELIGENTE: Busca o visitante quando o CPF chega a 11 dígitos
  useEffect(() => {
    const buscarDados = async () => {
      const cpfLimpo = cpf.replace(/\D/g, "");

      // Se não tiver 11 dígitos, reseta o aviso visual
      if (cpfLimpo.length !== 11) {
        setVisitanteJaCadastrado(false);
        return;
      }

      if (authSessao?.condominio?.id) {
        setBuscandoCpf(true);
        const visitante = await buscarVisitantePorCpf(
          cpfLimpo,
          authSessao.condominio.id,
        );

        if (visitante) {
          // Preenche os dados automaticamente!
          setNomeCompleto(visitante.nome || visitante.nome_completo || "");
          if (visitante.rg) setRg(visitante.rg);
          if (visitante.foto_url) setFotoBase64(visitante.foto_url);
          setVisitanteJaCadastrado(true);
        }
        setBuscandoCpf(false);
      }
    };

    buscarDados();
  }, [cpf]);

  const handleSalvar = async () => {
    const cpfLimpo = cpf.replace(/\D/g, "");

    if (!nomeCompleto.trim() || cpfLimpo.length !== 11) {
      mostrarAviso(
        "warning",
        "Atenção",
        "Informe o Nome Completo e um CPF válido (11 dígitos).",
      );
      return;
    }

    if (!visitaAdministracao && (!bloco.trim() || !unidade.trim())) {
      mostrarAviso(
        "warning",
        "Destino Inválido",
        "Informe Bloco e Unidade, ou marque como visita à Administração.",
      );
      return;
    }

    if (!visitaAdministracao && !unidadeDestinoId) {
      mostrarAviso(
        "warning",
        "Selecione o Morador",
        "Por favor, clique no morador da lista para confirmar a autorização.",
      );
      return;
    }

    if (tipoPadrao === "prestador" && !empresaPrestadora.trim()) {
      mostrarAviso(
        "warning",
        "Atenção",
        "Informe o nome da Empresa Prestadora (ex: Vivo, Enel, etc).",
      );
      return;
    }

    if (!authSessao?.condominio?.id) {
      mostrarAviso("error", "Erro de Sessão", "Condomínio não identificado.");
      return;
    }

    try {
      const payload: IRegistrarEntradaDataDTO = {
        nome_completo: nomeCompleto.trim(),
        cpf: cpfLimpo,
        rg: rg.trim() || undefined,
        foto_url: fotoBase64 || undefined,
        tipo_padrao: tipoPadrao,
        unidade_id: visitaAdministracao
          ? undefined
          : unidadeDestinoId || undefined,
        autorizado_por_id: visitaAdministracao
          ? undefined
          : moradorDestinoId || undefined,
        placa_veiculo: placaVeiculo.trim() || undefined,
        empresa_prestadora: empresaPrestadora.trim() || undefined,
        observacoes: obs.trim() || undefined,
        condominio_id: authSessao.condominio.id,
      };

      await registrarEntrada(payload);

      mostrarAviso(
        "success",
        "Acesso Liberado!",
        `${nomeCompleto} registrado com sucesso.`,
      );
    } catch (error: any) {
      const msg = error.response?.data?.message || "Erro ao liberar acesso.";
      mostrarAviso("error", "Acesso Negado", msg);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        tituloPagina="Novo Acesso"
        breadcrumb={["Visitantes", "Registro"]}
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
              {/* 📸 FOTO DO VISITANTE */}
              <TouchableOpacity
                style={styles.fotoContainer}
                onPress={tirarFoto}
                disabled={loading}
              >
                {fotoBase64 ? (
                  <Image
                    source={{ uri: fotoBase64 }}
                    style={styles.fotoPreview}
                  />
                ) : (
                  <View style={styles.fotoPlaceholder}>
                    <Ionicons name="camera" size={40} color={COLORS.primary} />
                    <Text style={styles.fotoTexto}>FOTOGRAFAR VISITANTE</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.labelSection}>DADOS DO VISITANTE</Text>

              {/* TIPO DE VISITANTE (Chips) */}
              <View style={styles.chipsRow}>
                {["visitante", "prestador", "corretor"].map((tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    style={[
                      styles.chip,
                      tipoPadrao === tipo && styles.chipAtivo,
                    ]}
                    onPress={() => {
                      setTipoPadrao(tipo as any);
                      if (tipo !== "prestador") {
                        setEmpresaPrestadora("");
                      }
                    }}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        tipoPadrao === tipo && styles.chipTextAtivo,
                      ]}
                    >
                      {tipo.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 0.5 }]}>
                  {/* ✅ Label do CPF com aviso de busca */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 5,
                    }}
                  >
                    <Text style={[styles.label, { marginBottom: 0 }]}>
                      CPF *
                    </Text>
                    {buscandoCpf && (
                      <ActivityIndicator
                        size="small"
                        color={COLORS.primary}
                        style={{ marginLeft: 10 }}
                      />
                    )}
                    {visitanteJaCadastrado && !buscandoCpf && (
                      <Text
                        style={{
                          color: COLORS.success,
                          fontSize: 10,
                          fontWeight: "bold",
                          marginLeft: 10,
                        }}
                      >
                        ✓ Cadastrado
                      </Text>
                    )}
                  </View>

                  <TextInput
                    style={styles.input}
                    value={cpf}
                    onChangeText={handleCpfChange}
                    keyboardType="numeric"
                    maxLength={14}
                    editable={!loading && !buscandoCpf}
                  />
                </View>
                <View
                  style={[styles.inputGroup, { flex: 0.5, marginLeft: 15 }]}
                >
                  <Text style={styles.label}>RG (Opcional)</Text>
                  <TextInput
                    style={styles.input}
                    value={rg}
                    onChangeText={(txt) => setRg(txt.toUpperCase())}
                    autoCapitalize="characters"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>NOME COMPLETO *</Text>
                <TextInput
                  style={styles.input}
                  value={nomeCompleto}
                  onChangeText={setNomeCompleto}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

              <View style={styles.divider} />

              {/* 🏢 DESTINO E OUTROS DADOS SEGUEM IGUAL... */}
              <Text style={styles.labelSection}>DESTINO E AUTORIZAÇÃO</Text>

              <View style={styles.urgenteContainer}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: COLORS.textMain }]}>
                    VISITA À ADMINISTRAÇÃO?
                  </Text>
                  <Text style={styles.subLabel}>
                    Marque se não for para um apartamento
                  </Text>
                </View>
                <Switch
                  value={visitaAdministracao}
                  onValueChange={setVisitaAdministracao}
                  trackColor={{ false: COLORS.grey300, true: COLORS.primary }}
                  disabled={loading}
                />
              </View>

              {!visitaAdministracao && (
                <>
                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 0.4 }]}>
                      <Text style={styles.label}>BLOCO *</Text>
                      <TextInput
                        style={styles.input}
                        value={bloco}
                        onChangeText={(txt) => {
                          setBloco(txt);
                          setMoradorDestinoId(null);
                          setUnidadeDestinoId(null);
                        }}
                        autoCapitalize="characters"
                        editable={!loading}
                      />
                    </View>
                    <View
                      style={[styles.inputGroup, { flex: 0.6, marginLeft: 15 }]}
                    >
                      <Text style={styles.label}>UNIDADE *</Text>
                      <TextInput
                        style={styles.input}
                        value={unidade}
                        onChangeText={(txt) => {
                          setUnidade(txt);
                          setMoradorDestinoId(null);
                          setUnidadeDestinoId(null);
                        }}
                        autoCapitalize="characters"
                        editable={!loading}
                      />
                    </View>
                  </View>

                  <SeletorMoradores
                    condominioId={authSessao?.condominio?.id!}
                    bloco={bloco}
                    unidade={unidade}
                    selecionadoId={moradorDestinoId}
                    titulo="Selecione o morador a ser visitado:"
                    onSelecionarMorador={(m: IMoradorUnidade) => {
                      setMoradorDestinoId(m.usuario_id);
                      setUnidadeDestinoId(m.unidade_id);
                    }}
                  />
                </>
              )}

              <View style={styles.divider} />

              <Text style={styles.labelSection}>DADOS COMPLEMENTARES</Text>

              {(tipoPadrao === "prestador" || empresaPrestadora.length > 0) && (
                <>
                  <Text style={styles.label}>SUGESTÕES DE EMPRESA</Text>
                  <View style={styles.chipsRow}>
                    {SUGESTOES_EMPRESAS.map((empresa) => (
                      <TouchableOpacity
                        key={empresa}
                        style={[
                          styles.chip,
                          empresaPrestadora === empresa && styles.chipAtivo,
                        ]}
                        onPress={() => setEmpresaPrestadora(empresa)}
                        disabled={loading}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            empresaPrestadora === empresa &&
                              styles.chipTextAtivo,
                          ]}
                        >
                          {empresa.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.input}
                      placeholder="Empresa (Ex: Vivo, Enel, Sabesp) *"
                      value={empresaPrestadora}
                      onChangeText={setEmpresaPrestadora}
                      autoCapitalize="words"
                      editable={!loading}
                    />
                    <Ionicons
                      name="briefcase-outline"
                      size={24}
                      color={COLORS.secondary}
                    />
                  </View>
                </>
              )}

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Placa do Veículo (Opcional)"
                  value={placaVeiculo}
                  onChangeText={setPlacaVeiculo}
                  autoCapitalize="characters"
                  editable={!loading}
                />
                <Ionicons
                  name="car-outline"
                  size={24}
                  color={COLORS.secondary}
                />
              </View>

              <Text style={[styles.label, { marginTop: 10 }]}>
                MOTIVO / OBSERVAÇÕES
              </Text>
              <View style={styles.chipsRow}>
                {SUGESTOES_MOTIVOS.map((motivo) => (
                  <TouchableOpacity
                    key={motivo}
                    style={[styles.chip, obs === motivo && styles.chipAtivo]}
                    onPress={() => setObs(motivo)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        obs === motivo && styles.chipTextAtivo,
                      ]}
                    >
                      {motivo.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                value={obs}
                onChangeText={setObs}
                editable={!loading}
                placeholder="Detalhes ou observações adicionais..."
              />
            </View>

            <TouchableOpacity
              style={[styles.btnSalvar, loading && { opacity: 0.7 }]}
              onPress={handleSalvar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.btnSalvarTexto}>LIBERAR ACESSO</Text>
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
            router.replace("/visitantes/lista-visitantes");
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
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.grey100,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  fotoPlaceholder: { alignItems: "center", padding: 10 },
  fotoTexto: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 5,
    textAlign: "center",
  },
  fotoPreview: { width: "100%", height: "100%", borderRadius: 70 },
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
  inputGroup: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#A0A0A0",
    marginBottom: 15,
  },
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
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 15 },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 5,
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
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
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
