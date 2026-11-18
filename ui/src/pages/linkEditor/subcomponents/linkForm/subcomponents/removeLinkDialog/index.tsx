import { useNavigate } from "react-router-dom";

import ConfirmDialog from "@components/confirmDialog";
import { deleteLink } from "@actions/links";
import useAction from "@hooks/useAction";

import type { RemoveLinkDialogProps } from "./types";

const RemoveLinkDialog = ({ link, isOpen, onClose }: RemoveLinkDialogProps) => {
  const navigate = useNavigate();

  const { execute, isPending } = useAction({
    action: () => deleteLink(link.id),
    toastMessages: {
      pending: "Excluindo o link…",
      success: "Link excluído",
      error: "Não foi possível excluir o link"
    },
    callback: () => navigate("/links", { replace: true })
  });

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => execute()}
      title="Excluir link"
      description={
        <>
          O endereço /{link.slug} para de redirecionar na hora e o slug fica livre para outro link ou página. Esta ação
          não pode ser desfeita.
        </>
      }
      confirmLabel="Excluir link"
      isPending={isPending}
    />
  );
};

export default RemoveLinkDialog;
