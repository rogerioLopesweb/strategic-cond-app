import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Hooks e Serviços Modulares
import { useUnidades } from "@/src/modules/admin/hooks/useUnidades";
import { useUsuarios } from "@/src/modules/admin/hooks/useUsuarios";
import {
  TPerfilAcesso,
  TTipoVinculo,
} from "@/src/modules/admin/services/usuarioService";
import { FeedbackModal } from "@/src/modules/common/components/FeedbackModal";
import { Header } from "@/src/modules/common/components/Header";
import { COLORS, SHADOWS } from "@/src/modules/common/constants/theme";
import { useAuthContext } from "@/src/modules/common/context/AuthContext";

export default function EditarUsuario() {
  const { id } = useLocalSearchParams();
  const { authSessao } = useAuthContext();

  // 🪝 Hooks de Lógica
  const {
    getUsuarioDetalhado,
    atualizarPerfil,
    handleAtualizarFoto,
    loading: loadingUser,
  } = useUsuarios();

  const {
    vincularMorador,
    registrarSaidaMorador,
    loading: loadingUnidades,
  } = useUnidades();

  // --- FORM 1: IDENTIDADE ---
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [emergencia, setEmergencia] = useState("");
  const [perfil, setPerfil] = useState<TPerfilAcesso>("morador");
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  // --- FORM 2: UNIDADES ---
  const [unidadesAtivas, setUnidadesAtivas] = useState<any[]>([]);
  const [blocoBusca, setBlocoBusca] = useState("");
  const [unidadeBusca, setUnidadeBusca] = useState("");
  const [tipoVinculo, setTipoVinculo] = useState<TTipoVinculo>("residente");

  // --- CONTROLE DE UI ---
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [fb, setFb] = useState({
    visible: false,
    type: "success" as any,
    title: "",
    message: "",
  });

  // 🛡️ Auxiliares de Máscara
  const maskPhone = (v: string) =>
    v
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 15);
  const maskDate = (v: string) =>
    v
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .substring(0, 10);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) && !/[/\\()|<>]/.test(email);
  };

  // 🔄 Carregamento Inicial
  useEffect(() => {
    if (id && authSessao?.condominio?.id) {
      carregarDados();
    }
  }, [id, authSessao?.condominio?.id]);

  const carregarDados = async () => {
    const res = await getUsuarioDetalhado(
      id as string,
      authSessao?.condominio?.id || "",
    );
    if (res) {
      setNome(res.nome_completo);
      setCpf(res.cpf);
      setEmail(res.email);
      setTelefone(maskPhone(res.telefone || ""));
      setDataNasc(maskDate(res.data_nascimento || ""));
      setEmergencia(res.contato_emergencia || "");
      setPerfil(res.perfil as TPerfilAcesso);
      setFotoPreview(res.foto_perfil);
      setUnidadesAtivas(res.unidades_vinculadas || []);
    }
  };

  /**
   * 📸 LÓGICA DE TROCA DE FOTO
   */
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setFb({
        visible: true,
        type: "warning",
        title: "Permissão",
        message: "Acesso às fotos negado.",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      try {
        setUploadingFoto(true);
        const res = await handleAtualizarFoto(
          id as string,
          authSessao?.condominio?.id || "",
          base64Img,
        );
        if (res.success) {
          setFotoPreview(res.url_foto);
          setFb({
            visible: true,
            type: "success",
            title: "Sucesso",
            message: "Foto de perfil atualizada!",
          });
        }
      } catch (e) {
        setFb({
          visible: true,
          type: "error",
          title: "Erro",
          message: "Falha ao processar imagem.",
        });
      } finally {
        setUploadingFoto(false);
      }
    }
  };

  /**
   * 💾 SALVAR DADOS PESSOAIS (Agora com Data Obrigatória)
   */
  const handleSalvarIdentidade = async () => {
    // ✅ Validação: Data agora é obrigatória (*)
    if (
      !nome ||
      !validateEmail(email) ||
      telefone.length < 14 ||
      dataNasc.length < 10
    ) {
      return setFb({
        visible: true,
        type: "warning",
        title: "Campos Incompletos",
        message:
          "Por favor, preencha todos os campos obrigatórios (*), incluindo a Data de Nascimento completa.",
      });
    }

    const exigeUnidade = ["morador", "subsindico", "conselheiro"].includes(
      perfil,
    );
    if (exigeUnidade && unidadesAtivas.length === 0) {
      return setFb({
        visible: true,
        type: "warning",
        title: "Unidade Obrigatória",
        message: `Perfis de moradia exigem pelo menos uma unidade vinculada.`,
      });
    }

    try {
      await atualizarPerfil({
        usuario_id: id as string,
        condominio_id: authSessao?.condominio?.id || "",
        nome_completo: nome,
        email: email.toLowerCase().trim(),
        telefone,
        data_nascimento: dataNasc,
        contato_emergencia: emergencia,
        perfil,
      });
      setFb({
        visible: true,
        type: "success",
        title: "Sucesso",
        message: "Dados sincronizados com a VPS.",
      });
    } catch (e) {
      setFb({
        visible: true,
        type: "error",
        title: "Erro",
        message: "Falha ao salvar alterações.",
      });
    }
  };

  const handleAdicionarNovaUnidade = async () => {
    if (!blocoBusca || !unidadeBusca) return;
    try {
      await vincularMorador({
        usuario_id: id as string,
        condominio_id: authSessao?.condominio?.id || "",
        identificador_bloco: blocoBusca,
        numero: unidadeBusca,
        tipo_vinculo: tipoVinculo,
      });
      setBlocoBusca("");
      setUnidadeBusca("");
      carregarDados();
    } catch (e) {
      setFb({
        visible: true,
        type: "error",
        title: "Erro",
        message: "Falha ao vincular unidade.",
      });
    }
  };

  if (!authSessao?.condominio?.id) {
    return (
      <View style={styles.loaderCenter}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        tituloPagina="Editar Usuário"
        breadcrumb={["Admin", "Edição"]}
        showBack
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CARD DE PERFIL ÚNICO */}
        <View style={styles.photoCard}>
          <TouchableOpacity
            onPress={pickImage}
            style={styles.avatarWrapper}
            disabled={uploadingFoto}
          >
            {uploadingFoto ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : fotoPreview ? (
              <Image source={{ uri: fotoPreview }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={30} color={COLORS.grey300} />
            )}
            <View style={styles.editIconBadge}>
              <Ionicons name="camera" size={10} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.userNameHeader}>{nome || "..."}</Text>
            <Text style={styles.userSubHeader}>
              {perfil.toUpperCase()} • CPF: {cpf}
            </Text>

            <TouchableOpacity onPress={pickImage} style={styles.rowTrocarFoto}>
              <Ionicons name="image-outline" size={14} color={COLORS.primary} />
              <Text style={styles.linkAlterarFoto}>Trocar Foto de Perfil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 💳 1. DADOS PESSOAIS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Informações Pessoais</Text>

          <Text style={styles.label}>NOME COMPLETO *</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} />

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>CPF (BLOQUEADO)</Text>
              <TextInput
                style={[styles.input, { color: COLORS.textSecondary }]}
                value={cpf}
                editable={false}
              />
            </View>
            <View style={[styles.col, { marginLeft: 10 }]}>
              <Text style={styles.label}>WHATSAPP *</Text>
              <TextInput
                style={styles.input}
                value={telefone}
                onChangeText={(t) => setTelefone(maskPhone(t))}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>E-MAIL *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <View style={[styles.col, { marginLeft: 10 }]}>
              <Text style={styles.label}>DATA NASCIMENTO *</Text>
              <TextInput
                style={styles.input}
                value={dataNasc}
                onChangeText={(t) => setDataNasc(maskDate(t))}
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          <Text style={styles.label}>CONTATO DE EMERGÊNCIA (NOME / TEL)</Text>
          <TextInput
            style={styles.input}
            value={emergencia}
            onChangeText={setEmergencia}
            placeholder="Ex: Maria (Esposa) - (11) 99999-9999"
          />

          <Text style={styles.label}>PERFIL DE ACESSO</Text>
          <View style={styles.perfilGrid}>
            {["morador", "sindico", "zelador", "portaria", "administracao"].map(
              (p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, perfil === p && styles.chipActive]}
                  onPress={() => setPerfil(p as TPerfilAcesso)}
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
              ),
            )}
          </View>

          <TouchableOpacity
            style={styles.btnSalvar}
            onPress={handleSalvarIdentidade}
            disabled={loadingUser}
          >
            {loadingUser ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnSalvarText}>
                SALVAR ALTERAÇÕES PESSOAIS
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 🏠 2. VÍNCULO PATRIMONIAL */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>2. Vínculo Patrimonial</Text>

          {unidadesAtivas.map((u, i) => (
            <View key={i} style={styles.uniItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.uniText}>
                  {u.identificador_bloco} - {u.numero}
                </Text>
                <Text style={styles.badgeVinculoText}>
                  {u.tipo_vinculo.toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.btnEncerrar}
                onPress={() =>
                  registrarSaidaMorador(id as string, u.unidade_id).then(
                    carregarDados,
                  )
                }
              >
                <Ionicons name="exit-outline" size={16} color={COLORS.error} />
                <Text style={styles.btnEncerrarText}>SAÍDA</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>BLOCO / RUA</Text>
              <TextInput
                style={styles.input}
                value={blocoBusca}
                onChangeText={setBlocoBusca}
                placeholder="A"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Nº UNIDADE</Text>
              <TextInput
                style={styles.input}
                value={unidadeBusca}
                onChangeText={setUnidadeBusca}
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
              onPress={handleAdicionarNovaUnidade}
              disabled={loadingUnidades}
            >
              {loadingUnidades ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="add" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <FeedbackModal
        visible={fb.visible}
        type={fb.type}
        title={fb.title}
        message={fb.message}
        onClose={() => setFb({ ...fb, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loaderCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: {
    padding: 20,
    maxWidth: 750,
    alignSelf: "center",
    width: "100%",
  },
  card: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 16,
    ...SHADOWS.light,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
  },
  photoCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
    ...SHADOWS.light,
    flexDirection: "row",
    gap: 15,
  },
  avatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: { width: "100%", height: "100%" },
  userNameHeader: { fontSize: 18, fontWeight: "bold", color: COLORS.textMain },
  userSubHeader: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  rowTrocarFoto: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  linkAlterarFoto: { fontSize: 11, color: COLORS.primary, fontWeight: "bold" },
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
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.textSecondary,
    marginBottom: 5,
    marginTop: 15,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#F8F9FB",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    color: COLORS.textMain,
  },
  row: { flexDirection: "row" },
  col: { flex: 1 },
  perfilGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 5 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 10, fontWeight: "bold", color: COLORS.textSecondary },
  chipTextActive: { color: "#fff" },
  btnSalvar: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
  },
  btnSalvarText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 20 },
  rowAction: { flexDirection: "row", gap: 8, marginTop: 15 },
  relBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    width: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  uniItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EDF2F7",
  },
  uniText: { fontSize: 14, fontWeight: "bold", color: COLORS.textMain },
  badgeVinculoText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.primary,
    textTransform: "uppercase",
  },
  btnEncerrar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FFF5F5",
  },
  btnEncerrarText: { color: COLORS.error, fontSize: 10, fontWeight: "bold" },
  editIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
});
