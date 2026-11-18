import ConfirmDialog from "@components/confirmDialog";
import { deletePage } from "@actions/sitePages";
import useAction from "@hooks/useAction";
import usePagesPage from "../../hook";

const RemovePageDialog = () => {
  const { removeTarget, handleCloseRemove, loadPages } = usePagesPage();

  const { execute, isPending } = useAction({
    action: (pageId: string) => deletePage(pageId),
    toastMessages: {
      pending: "Excluindo a página…",
      success: "Página excluída",
      error: "Não foi possível excluir a página"
    },
    callback: () => {
      loadPages();
      handleCloseRemove();
    }
  });

  return (
    <ConfirmDialog
      isOpen={removeTarget !== null}
      onClose={handleCloseRemove}
      onConfirm={() => removeTarget && execute(removeTarget.id)}
      title="Excluir página"
      description={
        <>
          O endereço /{removeTarget?.slug} sai do ar na hora, as versões e os acessos são apagados, e o slug fica livre para outro link ou página.
          Esta ação não pode ser desfeita.
        </>
      }
      confirmLabel="Excluir página"
      isPending={isPending}
    />
  );
};

export default RemovePageDialog;
