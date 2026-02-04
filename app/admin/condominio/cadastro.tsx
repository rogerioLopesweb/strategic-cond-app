import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Componentes, Hooks e Tipos
import { FeedbackModal } from "@/src/modules/common/components/FeedbackModal";
import { Header } from "@/src/modules/common/components/Header";
import { COLORS, SHADOWS, SIZES } from "@/src/modules/common/constants/theme";
import { useCondominio } from "@/src/modules/common/hooks/useCondominio";

// ✅ Utils (Máscara, Validação e CEP)
import { buscarEnderecoViaCEP } from "@/src/modules/common/utils/cep.utils";
import { maskCEP, maskCNPJ } from "@/src/modules/common/utils/mask.utils";
import { validateCNPJ } from "@/src/modules/common/utils/validation.utils";

export default function CadastroCondominio() {
  const router = useRouter();
  const { cadastrarNovoCondominio, loading } = useCondominio();
  const [fetchingCep, setFetchingCep] = useState(false);

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

  const [form, setForm] = useState({
    nome_fantasia: "",
    razao_social: "",
    cnpj: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  });

  // 🚀 Busca automática de CEP usando o utilitário isolado
  useEffect(() => {
    const cleanCep = form.cep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      (async () => {
        try {
          setFetchingCep(true);
          const data = await buscarEnderecoViaCEP(cleanCep);
          if (data) {
            setForm((prev) => ({
              ...prev,
              logradouro: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              estado: data.uf,
            }));
          } else {
            setFb({
              visible: true,
              type: "warning",
              title: "CEP não encontrado",
              message: "Verifique o número ou preencha o endereço manualmente.",
            });
          }
        } finally {
          setFetchingCep(false);
        }
      })();
    }
  }, [form.cep]);

  const handleSave = async () => {
    // 🛡️ Validação Rigorosa: Todos os campos são obrigatórios
    const temCamposVazios = Object.values(form).some((value) => !value.trim());

    if (temCamposVazios) {
      return setFb({
        visible: true,
        type: "warning",
        title: "Campos Obrigatórios",
        message:
          "Por favor, preencha todos os campos do formulário para prosseguir.",
      });
    }

    if (!validateCNPJ(form.cnpj)) {
      return setFb({
        visible: true,
        type: "warning",
        title: "CNPJ Inválido",
        message: "O CNPJ informado não passou na validação oficial.",
      });
    }

    try {
      // ✅ Chama o Hook que injeta o conta_id automaticamente
      const res = await cadastrarNovoCondominio(form);

      if (res.success) {
        setFb({
          visible: true,
          type: "success",
          title: "Sucesso!",
          message: "Condomínio cadastrado e vinculado com sucesso.",
          onAction: () => router.replace("/admin/condominio/lista"),
        });
      }
    } catch (error: any) {
      setFb({
        visible: true,
        type: "error",
        title: "Erro ao Salvar",
        message: error.message || "Erro na comunicação com a VPS.",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Header
        tituloPagina="Novo Condomínio"
        breadcrumb={["Admin", "Cadastro"]}
        showBack
      />

      <View style={styles.contentWrapper}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Identificação Jurídica</Text>

            <Text style={styles.label}>Nome Fantasia *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Residencial Solar"
              value={form.nome_fantasia}
              onChangeText={(v) => setForm({ ...form, nome_fantasia: v })}
            />

            <Text style={styles.label}>Razão Social *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Condomínio Edifício Solar LTDA"
              value={form.razao_social}
              onChangeText={(v) => setForm({ ...form, razao_social: v })}
            />

            <Text style={styles.label}>CNPJ *</Text>
            <TextInput
              style={styles.input}
              placeholder="00.000.000/0001-00"
              keyboardType="numeric"
              maxLength={18}
              value={form.cnpj}
              onChangeText={(v) => setForm({ ...form, cnpj: maskCNPJ(v) })}
            />

            <View style={styles.divider} />

            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Localização</Text>
              {fetchingCep && (
                <ActivityIndicator size="small" color={COLORS.accent} />
              )}
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>CEP *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="00000-000"
                  keyboardType="numeric"
                  maxLength={9}
                  value={form.cep}
                  onChangeText={(v) => setForm({ ...form, cep: maskCEP(v) })}
                />
              </View>
              <View style={{ flex: 2, marginLeft: 10 }}>
                <Text style={styles.label}>Bairro *</Text>
                <TextInput
                  style={styles.input}
                  value={form.bairro}
                  onChangeText={(v) => setForm({ ...form, bairro: v })}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 3 }}>
                <Text style={styles.label}>Logradouro *</Text>
                <TextInput
                  style={styles.input}
                  value={form.logradouro}
                  onChangeText={(v) => setForm({ ...form, logradouro: v })}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.label}>Nº *</Text>
                <TextInput
                  style={styles.input}
                  value={form.numero}
                  onChangeText={(v) => setForm({ ...form, numero: v })}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 3 }}>
                <Text style={styles.label}>Cidade *</Text>
                <TextInput
                  style={styles.input}
                  value={form.cidade}
                  onChangeText={(v) => setForm({ ...form, cidade: v })}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.label}>UF *</Text>
                <TextInput
                  style={styles.input}
                  maxLength={2}
                  autoCapitalize="characters"
                  value={form.estado}
                  onChangeText={(v) => setForm({ ...form, estado: v })}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.btnSave, loading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="save-outline"
                    size={20}
                    color={COLORS.white}
                  />
                  <Text style={styles.btnSaveText}>Salvar Condomínio</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

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
  contentWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: 1350,
    alignSelf: "center",
    paddingHorizontal: 20,
  },
  scrollContent: { paddingVertical: 20 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 25,
    marginBottom: 30,
    ...SHADOWS.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 20,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    color: COLORS.textMain,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    backgroundColor: COLORS.grey100,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 15,
    marginBottom: 18,
    fontSize: 16,
    color: COLORS.textMain,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
    opacity: 0.5,
  },
  btnSave: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
    ...SHADOWS.light,
  },
  btnSaveText: { color: COLORS.white, fontSize: 16, fontWeight: "bold" },
});
