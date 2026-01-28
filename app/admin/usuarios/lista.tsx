import AdminPlaceholder from "@/src/modules/admin/components/AdminPlaceholder";

export default function ListaUsuarios() {
  return (
    <AdminPlaceholder
      titulo="Lista de Usuários"
      breadcrumb={["Admin", "Usuários", "Lista"]}
    />
  );
}
