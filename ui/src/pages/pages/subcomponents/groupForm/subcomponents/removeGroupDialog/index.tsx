import ConfirmDialog from "@components/confirmDialog";
import { deletePageGroup } from "@actions/sitePages";
import usePagesPage from "../../../../hook";
import useAction from "@hooks/useAction";

import type { RemoveGroupDialogProps } from "./types";

const describePages = (pageCount: number) => {
  if (pageCount === 0) return "O grupo está vazio, então nenhuma página muda.";
  if (pageCount === 1) return "A página deste grupo fica sem grupo e continua no ar.";
  return `As ${pageCount} páginas deste grupo ficam sem grupo e continuam no ar.`;
};

const RemoveGroupDialog = ({ group, pageCount, isOpen, onClose }: RemoveGroupDialogProps) => {
  const { handleGroupRemoved } = usePagesPage();

  const { execute, isPending } = useAction({
    action: () => deletePageGroup(group.id),
    toastMessages: { pending: "Excluindo o grupo…", success: "Grupo excluído", error: "Não foi possível excluir o grupo" },
    callback: () => handleGroupRemoved(group.id)
  });

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => execute()}
      title="Excluir grupo"
      description={`${describePages(pageCount)} Esta ação não pode ser desfeita.`}
      confirmLabel="Excluir grupo"
      isPending={isPending}
    />
  );
};

export default RemoveGroupDialog;
