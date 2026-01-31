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

// ✅ Imports Modulares
import { useUsuarios } from "@/src/modules/admin/hooks/useUsuarios";
import {
  IUnidadeVinculo,
  IUsuarioCadastroPayload,
  TPerfilAcesso,
  TTipoVinculo,
} from "@/src/modules/admin/services/usuarioService";
import { FeedbackModal } from "@/src/modules/common/components/FeedbackModal"; // ✅ Voltando para o Modal
import { Header } from "@/src/modules/common/components/Header";
import { COLORS, SHADOWS } from "@/src/modules/common/constants/theme";
import { useAuthContext } from "@/src/modules/common/context/AuthContext";

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
  }>({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  // Auxiliares de Máscara
  const maskCPF = (v: string) =>
    v
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .substring(0, 14);
  const maskPhone = (v: string) =>
    v
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 15);

  // 1. Regex Robusto para E-mail
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Além do regex, vamos barrar caracteres que costumam causar erro em bancos de dados
    const hasInvalidChars = /[/\\()|<>]/.test(email);

    return regex.test(email) && !hasInvalidChars;
  };

  const handleSalvar = async () => {
    // 1. Validação de campos básicos
    if (!nome || cpf.length < 14 || !email.includes("@") || !telefone) {
      return setFb({
        visible: true,
        type: "warning",
        title: "Campos Incompletos",
        message:
          "Por favor, preencha todos os campos obrigatórios (*) corretamente.",
      });
    }

    // Validação de E-mail Refinada
    if (!validateEmail(email)) {
      return setFb({
        visible: true,
        type: "warning",
        title: "E-mail Inválido",
        message:
          "O formato do e-mail está incorreto. Certifique-se de não usar barras (/) ou caracteres especiais inválidos.",
      });
    }

    // ✅ 2. Validação RIGOROSA de Unidade (O que faltava)
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

      // Log para conferência final
      console.log(
        "🚀 Enviando Cadastro Mestre:",
        JSON.stringify(payload, null, 2),
      );

      const res = await cadastrarUsuarioCompleto(payload);

      if (res.success) {
        setFb({
          visible: true,
          type: "success",
          title: "Cadastro Realizado!",
          message: `O acesso foi criado. Senha provisória: ${res.senha_provisoria}`,
        });
      }
    } catch (err: any) {
      setFb({
        visible: true,
        type: "error",
        title: "Erro no Cadastro",
        message:
          err.response?.data?.message || "Não foi possível conectar à VPS.",
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
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

      {/* ✅ FeedbackModal integrado para confirmação de página inteira */}
      <FeedbackModal
        visible={fb.visible}
        type={fb.type}
        title={fb.title}
        message={fb.message}
        onClose={() => {
          setFb({ ...fb, visible: false });
          if (fb.type === "success") {
            router.back(); // Volta para a lista após o OK no sucesso
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    padding: 20,
    maxWidth: 650,
    alignSelf: "center",
    width: "100%",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
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
    backgroundColor: "#F9F9FB",
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
    backgroundColor: "#F9F9FB",
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
    ...SHADOWS.medium,
  },
  btnSaveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
