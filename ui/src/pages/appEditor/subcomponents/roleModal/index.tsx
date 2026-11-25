import { createRole, updateRole } from "@actions/apps";
import KvRoleForm from "@components/kvRoleForm";
import useAppEditorPage from "../../hook";
import useAction from "@hooks/useAction";
import Dialog from "@components/dialog";

import type { RoleFormValues } from "@utils/types/application";

const RoleModal = () => {
  const { applicationId, isRoleModalOpen, editingRole, handleCloseRoleModal, handleRefresh } = useAppEditorPage();

  const { execute } = useAction({
    action: ({ name, description, rules, isOwnDocumentsOnly }: RoleFormValues) =>
      editingRole
        ? updateRole(applicationId, editingRole.name, { description, rules, isOwnDocumentsOnly })
        : createRole(applicationId, { name, description, rules, isOwnDocumentsOnly }),
    toastMessages: {
      pending: editingRole ? "Salvando o cargo…" : "Criando o cargo…",
      success: editingRole ? "Cargo atualizado" : "Cargo criado",
      error: editingRole ? "Não foi possível salvar o cargo" : "Não foi possível criar o cargo"
    },
    callback: () => {
      handleCloseRoleModal();
      handleRefresh();
    }
  });

  return (
    <Dialog
      isOpen={isRoleModalOpen}
      onClose={handleCloseRoleModal}
      eyebrow={editingRole ? "Editar cargo" : "Novo cargo"}
      title={editingRole ? editingRole.name : "Criar cargo"}
      description="Escolha o que o cargo pode fazer em cada coleção. O que não estiver numa regra é recusado."
      maxWidth="560px"
    >
      {isRoleModalOpen && <KvRoleForm key={editingRole?.name ?? "new"} role={editingRole} onSubmit={execute} onCancel={handleCloseRoleModal} />}
    </Dialog>
  );
};

export default RoleModal;
