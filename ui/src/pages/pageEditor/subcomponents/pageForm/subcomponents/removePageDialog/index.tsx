import { useNavigate } from "react-router-dom";

import ConfirmDialog from "@components/confirmDialog";
import { deletePage } from "@actions/sitePages";
import useAction from "@hooks/useAction";

import type { RemovePageDialogProps } from "./types";

const RemovePageDialog = ({ sitePage, isOpen, onClose }: RemovePageDialogProps) => {
  const navigate = useNavigate();

  const { execute, isPending } = useAction({
    action: () => deletePage(sitePage.id),
    toastMessages: {
      pending: "Excluindo a página…",
      success: "Página excluída",
      error: "Não foi possível excluir a página"
    },
    callback: () => navigate("/pages", { replace: true })
  });

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => execute()}
      title="Excluir página"
      description={
        <>
          O endereço /{sitePage.slug} sai do ar na hora, as versões e os acessos são apagados, e o slug fica livre para outro link ou página. Esta ação
          não pode ser desfeita.
        </>
      }
      confirmLabel="Excluir página"
      isPending={isPending}
    />
  );
};

export default RemovePageDialog;
