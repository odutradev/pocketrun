import ConfirmDialog from "@components/confirmDialog";
import { deleteUser } from "@actions/users";
import useAction from "@hooks/useAction";
import useUsersPage from "../../hook";

const RemoveUserDialog = () => {
  const { removeTarget, handleCloseRemove, loadUsers } = useUsersPage();

  const { execute, isPending } = useAction({
    action: (userId: string) => deleteUser(userId),
    toastMessages: {
      pending: "Removendo o usuário…",
      success: "Usuário removido",
      error: "Não foi possível remover o usuário"
    },
    callback: () => {
      loadUsers();
      handleCloseRemove();
    }
  });

  return (
    <ConfirmDialog
      isOpen={removeTarget !== null}
      onClose={handleCloseRemove}
      onConfirm={() => removeTarget && execute(removeTarget.id)}
      title="Remover usuário"
      description={
        <>
          {removeTarget?.name} ({removeTarget?.email}) perde o acesso ao painel na hora. Esta ação não pode ser
          desfeita. Usuários com aplicações não podem ser removidos.
        </>
      }
      confirmLabel="Remover usuário"
      isPending={isPending}
    />
  );
};

export default RemoveUserDialog;
