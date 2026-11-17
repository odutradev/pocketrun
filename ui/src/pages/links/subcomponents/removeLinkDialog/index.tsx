import ConfirmDialog from "@components/confirmDialog";
import { deleteLink } from "@actions/links";
import useAction from "@hooks/useAction";
import useLinksPage from "../../hook";

const RemoveLinkDialog = () => {
  const { removeTarget, handleCloseRemove, loadLinks } = useLinksPage();

  const { execute, isPending } = useAction({
    action: (linkId: string) => deleteLink(linkId),
    toastMessages: {
      pending: "Excluindo o link…",
      success: "Link excluído",
      error: "Não foi possível excluir o link"
    },
    callback: () => {
      loadLinks();
      handleCloseRemove();
    }
  });

  return (
    <ConfirmDialog
      isOpen={removeTarget !== null}
      onClose={handleCloseRemove}
      onConfirm={() => removeTarget && execute(removeTarget.id)}
      title="Excluir link"
      description={
        <>
          O endereço /{removeTarget?.slug} para de redirecionar na hora e o slug fica livre para outro link ou página.
          Esta ação não pode ser desfeita.
        </>
      }
      confirmLabel="Excluir link"
      isPending={isPending}
    />
  );
};

export default RemoveLinkDialog;
