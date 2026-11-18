import ConfirmDialog from "@components/confirmDialog";
import { deleteLinkGroup } from "@actions/links";
import useLinksPage from "../../../../hook";
import useAction from "@hooks/useAction";

import type { RemoveGroupDialogProps } from "./types";

const describeLinks = (linkCount: number) => {
  if (linkCount === 0) return "O grupo está vazio, então nenhum link muda.";
  if (linkCount === 1) return "O link deste grupo fica sem grupo e continua funcionando.";
  return `Os ${linkCount} links deste grupo ficam sem grupo e continuam funcionando.`;
};

const RemoveGroupDialog = ({ group, linkCount, isOpen, onClose }: RemoveGroupDialogProps) => {
  const { handleGroupRemoved } = useLinksPage();

  const { execute, isPending } = useAction({
    action: () => deleteLinkGroup(group.id),
    toastMessages: { pending: "Excluindo o grupo…", success: "Grupo excluído", error: "Não foi possível excluir o grupo" },
    callback: () => handleGroupRemoved(group.id)
  });

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => execute()}
      title="Excluir grupo"
      description={`${describeLinks(linkCount)} Esta ação não pode ser desfeita.`}
      confirmLabel="Excluir grupo"
      isPending={isPending}
    />
  );
};

export default RemoveGroupDialog;
