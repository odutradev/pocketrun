import { useState } from "react";

import { createLinkGroup, deleteLinkGroup, updateLinkGroup } from "@actions/links";
import { linkGroupSchema } from "@utils/validations/link";
import { CreateForm, Empty, GroupList } from "./styles";
import GroupRow from "./subcomponents/groupRow";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Dialog from "@components/dialog";
import Input from "@components/input";
import useLinksPage from "../../hook";
import useForm from "@hooks/useForm";

import type { LinkGroupValues } from "@utils/types/link";

const GroupsDialog = () => {
  const { groups, isGroupsOpen, handleCloseGroups, loadLinks } = useLinksPage();
  const [pendingGroupId, setPendingGroupId] = useState<string | null>(null);

  const { execute: create } = useAction({
    action: (values: LinkGroupValues) => createLinkGroup(values),
    toastMessages: { pending: "Criando o grupo…", success: "Grupo criado", error: "Não foi possível criar o grupo" },
    callback: () => {
      reset();
      loadLinks();
    }
  });

  const { execute: rename } = useAction({
    action: (groupId: string, values: LinkGroupValues) => updateLinkGroup(groupId, values),
    toastMessages: { pending: "Renomeando o grupo…", success: "Grupo renomeado", error: "Não foi possível renomear o grupo" },
    callback: () => loadLinks()
  });

  const { execute: remove } = useAction({
    action: (groupId: string) => deleteLinkGroup(groupId),
    toastMessages: { pending: "Excluindo o grupo…", success: "Grupo excluído", error: "Não foi possível excluir o grupo" },
    callback: () => loadLinks()
  });

  const { values, errors, isSubmitting, handleChange, handleSubmit, reset } = useForm({
    schema: linkGroupSchema,
    initialValues: { name: "" },
    onSubmit: create
  });

  const runOnGroup = async (groupId: string, task: () => Promise<unknown>) => {
    setPendingGroupId(groupId);
    await task();
    setPendingGroupId(null);
  };

  return (
    <Dialog
      isOpen={isGroupsOpen}
      onClose={handleCloseGroups}
      eyebrow="Links"
      title="Grupos"
      description="Grupos só organizam a lista. Excluir um grupo não apaga os links: eles ficam sem grupo."
    >
      <CreateForm onSubmit={handleSubmit} noValidate>
        <Input
          label="Novo grupo"
          name="name"
          autoComplete="off"
          placeholder="Campanhas"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />
        <Button type="submit" isLoading={isSubmitting} loadingLabel="Criando…">
          Criar
        </Button>
      </CreateForm>
      {groups.length === 0 ? (
        <Empty>Nenhum grupo ainda.</Empty>
      ) : (
        <GroupList>
          {groups.map((group) => (
            <GroupRow
              key={`${group.id}-${group.name}`}
              group={group}
              isPending={pendingGroupId === group.id}
              onRename={(name) => runOnGroup(group.id, () => rename(group.id, { name }))}
              onRemove={() => runOnGroup(group.id, () => remove(group.id))}
            />
          ))}
        </GroupList>
      )}
    </Dialog>
  );
};

export default GroupsDialog;
