import useAppEditorPage from "../../hook";
import Dialog from "@components/dialog";
import RoleForm from "../roleForm";

const RoleModal = () => {
  const { isRoleModalOpen, editingRole, handleCloseRoleModal } = useAppEditorPage();

  return (
    <Dialog
      isOpen={isRoleModalOpen}
      onClose={handleCloseRoleModal}
      eyebrow={editingRole ? "Editar cargo" : "Novo cargo"}
      title={editingRole ? editingRole.name : "Criar cargo"}
      description="Escolha o que o cargo pode fazer em cada coleção. O que não estiver numa regra é recusado."
      maxWidth="560px"
    >
      {isRoleModalOpen && <RoleForm key={editingRole?.name ?? "new"} role={editingRole} />}
    </Dialog>
  );
};

export default RoleModal;
