import ConfirmDialog from "@components/confirmDialog";
import { deleteApplication } from "@actions/apps";
import useAction from "@hooks/useAction";
import useKvPage from "../../hook";

const RemoveAppDialog = () => {
  const { removeTarget, handleCloseRemove, loadApplications } = useKvPage();

  const { execute, isPending } = useAction({
    action: (applicationId: string) => deleteApplication(applicationId),
    toastMessages: {
      pending: "Excluindo a aplicação…",
      success: "Aplicação excluída",
      error: "Não foi possível excluir a aplicação"
    },
    callback: () => {
      loadApplications();
      handleCloseRemove();
    }
  });

  return (
    <ConfirmDialog
      isOpen={removeTarget !== null}
      onClose={handleCloseRemove}
      onConfirm={() => removeTarget && execute(removeTarget.id)}
      title="Excluir aplicação"
      description={
        <>
          {removeTarget?.name} e tudo o que pertence a ela (coleções, documentos e tokens) são apagados de vez, e os clientes que usam os
          tokens dela param de funcionar na hora. Esta ação não pode ser desfeita.
        </>
      }
      confirmLabel="Excluir aplicação"
      confirmationText={removeTarget?.projectId}
      isPending={isPending}
    />
  );
};

export default RemoveAppDialog;
