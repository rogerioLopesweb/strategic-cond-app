import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Imports Modulares e Hooks
import { useUsuarios } from "@/src/modules/admin/hooks/useUsuarios";
import {
  IUnidadeVinculo,
  IUsuarioCadastroPayload,
  TPerfilAcesso,
  TTipoVinculo,
} from "@/src/modules/admin/types/usuarioTypes";
import { FeedbackModal } from "@/src/modules/common/components/FeedbackModal";
import { Header } from "@/src/modules/common/components/Header";
import { COLORS, SHADOWS, SIZES } from "@/src/modules/common/constants/theme";
import { useAuthContext } from "@/src/modules/common/context/AuthContext";

// ✅ Utils Centralizados
import { maskCPF, maskPhone } from "@/src/modules/common/utils/mask.utils";
import { validateEmail } from "@/src/modules/common/utils/validation.utils";

export default function CadastroUsuario() {
  const router = useRouter();
  const { authSessao } = useAuthContext();
  const { loading, cadastrarUsuarioCompleto } = useUsuarios();

  // 1. Dados Pessoais
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [perfil, setPerfil] = useState<TPerfilAcesso>("morador");

  // 2. Vínculos
  const [unidadesVinculadas, setUnidadesVinculadas] = useState<
    IUnidadeVinculo[]
  >([]);
  const [bloco, setBloco] = useState("");
  const [unidade, setUnidade] = useState("");
  const [tipoVinculo, setTipoVinculo] = useState<TTipoVinculo>("residente");

  // 3. Estado do FeedbackModal
  const [fb, setFb] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning" | "confirm";
    title: string;
    message: string;
    onAction?: () => void;
  }>({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const handleSalvar = async () => {
    // 🛡️ 1. Validação de campos básicos
    if (!nome || cpf.length < 14 || !telefone || !email) {
      return setFb({
        visible: true,
        type: "warning",
        title: "Campos Incompletos",
        message:
          "Por favor, preencha todos os campos obrigatórios (*) corretamente.",
      });
    }

    // 🛡️ 2. Validação de E-mail Refinada (Usando util)
    if (!validateEmail(email)) {
      return setFb({
        visible: true,
        type: "warning",
        title: "E-mail Inválido",
        message:
          "O formato do e-mail está incorreto ou contém caracteres inválidos (/ \\ |).",
      });
    }

    // 🛡️ 3. Validação RIGOROSA de Unidade
    const exigeUnidade = ["morador", "subsindico", "conselheiro"].includes(
      perfil,
    );

    if (exigeUnidade && unidadesVinculadas.length === 0) {
      return setFb({
        visible: true,
        type: "warning",
        title: "Unidade Obrigatória",
        message: `Para o perfil ${perfil.toUpperCase()}, você deve adicionar pelo menos uma unidade abaixo antes de finalizar.`,
      });
    }

    try {
      const payload: IUsuarioCadastroPayload = {
        nome_completo: nome,
        cpf: cpf.replace(/\D/g, ""),
        email: email.toLowerCase().trim(),
        telefone,
        perfil,
        unidades: unidadesVinculadas,
        condominio_id: authSessao?.condominio?.id ?? "",
        foto_base64: null,
      };

      const res = await cadastrarUsuarioCompleto(payload);

      if (res.success) {
        setFb({
          visible: true,
          type: "success",
          title: "Cadastro Realizado!",
          message: `O acesso foi criado com sucesso. Senha provisória enviada: ${res.senha_provisoria}`,
          onAction: () => router.back(),
        });
      }
    } catch (err: any) {
      setFb({
        visible: true,
        type: "error",
        title: "Erro no Cadastro",
        message:
          err.response?.data?.message ||
          "Não foi possível conectar à VPS do StrategicCond.",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Header
        tituloPagina="Novo Usuário"
        breadcrumb={["Admin", "Cadastro"]}
        showBack
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SEÇÃO 1: PESSOAL */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Informações Pessoais</Text>

          <Text style={styles.label}>NOME COMPLETO *</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Nome do morador ou funcionário"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>CPF *</Text>
              <TextInput
                style={styles.input}
                value={cpf}
                onChangeText={(t) => setCpf(maskCPF(t))}
                keyboardType="numeric"
                maxLength={14}
                placeholder="000.000.000-00"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>WHATSAPP *</Text>
              <TextInput
                style={styles.input}
                value={telefone}
                onChangeText={(t) => setTelefone(maskPhone(t))}
                keyboardType="phone-pad"
                maxLength={15}
                placeholder="(00) 00000-0000"
              />
            </View>
          </View>

          <Text style={styles.label}>E-MAIL (LOGIN) *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="seu@email.com"
          />

          <Text style={styles.label}>PERFIL DE ACESSO</Text>
          <View style={styles.perfilGrid}>
            {(
              [
                "morador",
                "sindico",
                "administracao",
                "portaria",
                "zelador",
              ] as TPerfilAcesso[]
            ).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.chip, perfil === p && styles.chipActive]}
                onPress={() => setPerfil(p)}
              >
                <Text
                  style={[
                    styles.chipText,
                    perfil === p && styles.chipTextActive,
                  ]}
                >
                  {p.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SEÇÃO 2: UNIDADE */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>2. Vínculo Patrimonial</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>BLOCO / RUA</Text>
              <TextInput
                style={styles.input}
                value={bloco}
                onChangeText={setBloco}
                placeholder="A"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Nº UNIDADE</Text>
              <TextInput
                style={styles.input}
                value={unidade}
                onChangeText={setUnidade}
                placeholder="101"
              />
            </View>
          </View>

          <View style={styles.rowAction}>
            {(["proprietario", "inquilino", "residente"] as TTipoVinculo[]).map(
              (t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.relBtn,
                    tipoVinculo === t && styles.relBtnActive,
                  ]}
                  onPress={() => setTipoVinculo(t)}
                >
                  <Text
                    style={[
                      styles.relText,
                      tipoVinculo === t && styles.relTextActive,
                    ]}
                  >
                    {t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ),
            )}
            <TouchableOpacity
              style={styles.btnAdd}
              onPress={() => {
                if (bloco && unidade) {
                  setUnidadesVinculadas([
                    ...unidadesVinculadas,
                    {
                      identificador_bloco: bloco,
                      numero: unidade,
                      tipo_vinculo: tipoVinculo,
                    },
                  ]);
                  setBloco("");
                  setUnidade("");
                }
              }}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {unidadesVinculadas.map((u, i) => (
            <View key={i} style={styles.uniItem}>
              <Text style={styles.uniText}>
                {u.identificador_bloco} - {u.numero} ({u.tipo_vinculo})
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setUnidadesVinculadas(
                    unidadesVinculadas.filter((_, idx) => idx !== i),
                  )
                }
              >
                <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.btnSave}
          onPress={handleSalvar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnSaveText}>FINALIZAR CADASTRO</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <FeedbackModal
        visible={fb.visible}
        type={fb.type}
        title={fb.title}
        message={fb.message}
        onClose={() => {
          setFb({ ...fb, visible: false });
          if (fb.onAction) fb.onAction();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    padding: 20,
    maxWidth: 650, // Mantido para formulários de usuário (UX mais focada)
    alignSelf: "center",
    width: "100%",
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: SIZES.radius,
    ...SHADOWS.light,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    paddingLeft: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: COLORS.grey100,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textMain,
  },
  row: { flexDirection: "row" },
  perfilGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 11, fontWeight: "bold", color: COLORS.textSecondary },
  chipTextActive: { color: "#fff" },
  rowAction: { flexDirection: "row", gap: 8, marginTop: 15 },
  relBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  relBtnActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  relText: { fontSize: 10, fontWeight: "bold", color: COLORS.textSecondary },
  relTextActive: { color: "#fff" },
  btnAdd: {
    backgroundColor: COLORS.primary,
    width: 45,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  uniItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.grey100,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  uniText: { fontSize: 13, fontWeight: "600", color: COLORS.textMain },
  btnSave: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 40,
    ...SHADOWS.medium,
  },
  btnSaveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
