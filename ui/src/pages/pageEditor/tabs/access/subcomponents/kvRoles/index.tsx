import { Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import { RoleActions, RoleDescription, RoleHeader, RoleItem, RoleList, RoleMain, RoleName, RuleList, RuleLine, Strong } from "./styles";
import { Count, Hint, Mono, Panel, PanelHeader, PanelTitle } from "../../styles";
import { applyPageConfig } from "@actions/sitePages";
import ConfirmDialog from "@components/confirmDialog";
import { describeRoleRule } from "@utils/functions";
import KvRoleForm from "@components/kvRoleForm";
import usePageEditorPage from "../../../../hook";
import IconButton from "@components/iconButton";
import { adminRoleName } from "@assets/data";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Dialog from "@components/dialog";
import Badge from "@components/badge";

import type { KvRole, RoleFormValues } from "@utils/types/application";
import type { PageConfigRole } from "@utils/types/sitePage";
import type { RoleEditor } from "./types";

const maxRoles = 20;

const toConfigRole = ({ name, description, isOwnDocumentsOnly, rules }: KvRole | RoleFormValues): PageConfigRole => ({
  name,
  description,
  isOwnDocumentsOnly,
  rules: rules.map((rule) => ({ collection: rule.collection.trim(), operations: rule.operations, maxDocuments: rule.maxDocuments }))
});

const KvRoles = () => {
  const { sitePage, kv, access, reloadAccessData } = usePageEditorPage();
  const [editor, setEditor] = useState<RoleEditor | null>(null);
  const [removing, setRemoving] = useState<KvRole | null>(null);
  const pageId = sitePage?.id ?? "";
  const application = kv?.application ?? null;
  const roles = application?.roles ?? [];
  const isEditable = Boolean(application?.pageId);

  const usedBy = (roleName: string): string[] => {
    const binding = kv?.binding;
    if (!binding) return [];
    const subjects = binding.publicRole === roleName ? ["sem PIN"] : [];
    const pinRoles = (access?.keys ?? []).map((key) => key.role);
    return [
      ...subjects,
      ...binding.roles
        .filter((mapping) => mapping.kvRole === roleName && pinRoles.includes(mapping.pageRole))
        .map((mapping) => mapping.pageRole || "PIN geral")
    ];
  };

  const save = useAction({
    action: (next: PageConfigRole[]) => applyPageConfig(pageId, { kv: { roles: next } }),
    toastMessages: { pending: "Salvando os cargos…", success: "Cargos salvos", error: "Não foi possível salvar os cargos" },
    callback: () => {
      setEditor(null);
      setRemoving(null);
      reloadAccessData();
    }
  });

  const handleSubmit = (values: RoleFormValues) => {
    const edited = toConfigRole(values);
    const current = roles.map(toConfigRole);
    const next = editor?.role ? current.map((role) => (role.name === editor.role?.name ? { ...edited, name: role.name } : role)) : [...current, edited];
    return save.execute(next);
  };

  if (!application) return null;

  return (
    <Panel aria-labelledby="page-kv-roles-title">
      <PanelHeader>
        <PanelTitle id="page-kv-roles-title">
          Cargos dos dados
          <Count>{roles.length + 1}</Count>
        </PanelTitle>
        {isEditable && (
          <Button size="sm" leftIcon={<PlusIcon />} disabled={roles.length >= maxRoles} onClick={() => setEditor({ role: null })}>
            Novo cargo
          </Button>
        )}
      </PanelHeader>
      <Hint>
        Cada cargo diz o que pode ser feito em cada coleção. Uma regra com <Mono>*</Mono> vale para as coleções sem regra própria. Trocar as regras
        vale no próximo pedido da página.
      </Hint>
      <RoleList>
        <RoleItem>
          <RoleMain>
            <RoleHeader>
              <RoleName>{adminRoleName}</RoleName>
              <Badge tone="accent">Acesso total</Badge>
            </RoleHeader>
            <RoleDescription>Lê, grava e apaga em todas as coleções. Fixo, não pode ser editado.</RoleDescription>
          </RoleMain>
        </RoleItem>
        {roles.map((role) => {
          const subjects = usedBy(role.name);
          return (
            <RoleItem key={role.name}>
              <RoleMain>
                <RoleHeader>
                  <RoleName>{role.name}</RoleName>
                  {role.isOwnDocumentsOnly && <Badge tone="warning">Só os próprios documentos</Badge>}
                  {subjects.length > 0 && <Badge>{subjects.join(", ")}</Badge>}
                </RoleHeader>
                {role.description && <RoleDescription>{role.description}</RoleDescription>}
                <RuleList>
                  {role.rules.map((rule) => (
                    <RuleLine key={rule.collection}>{describeRoleRule(rule)}</RuleLine>
                  ))}
                </RuleList>
              </RoleMain>
              {isEditable && (
                <RoleActions>
                  <IconButton size="sm" label={`Editar o cargo ${role.name}`} icon={<Pencil1Icon />} onClick={() => setEditor({ role })} />
                  <IconButton variant="danger" size="sm" label={`Apagar o cargo ${role.name}`} icon={<TrashIcon />} onClick={() => setRemoving(role)} />
                </RoleActions>
              )}
            </RoleItem>
          );
        })}
      </RoleList>
      {!isEditable && <Hint>Os cargos desta aplicação são editados no KV.</Hint>}
      <Dialog
        isOpen={editor !== null}
        onClose={() => setEditor(null)}
        eyebrow={editor?.role ? "Editar cargo" : "Novo cargo"}
        title={editor?.role ? editor.role.name : "Criar cargo"}
        description="Escolha o que o cargo pode fazer em cada coleção. O que não estiver numa regra é recusado."
        maxWidth="560px"
      >
        {editor && <KvRoleForm key={editor.role?.name ?? "new"} role={editor.role} onSubmit={handleSubmit} onCancel={() => setEditor(null)} />}
      </Dialog>
      <ConfirmDialog
        isOpen={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && save.execute(roles.filter((role) => role.name !== removing.name).map(toConfigRole))}
        isPending={save.isPending}
        title="Apagar cargo?"
        description={
          <>
            O cargo <Strong>{removing?.name}</Strong> sai dos dados da página. Quem abria com ele fica sem acesso aos dados até você escolher outro
            cargo. Os documentos continuam guardados.
          </>
        }
        confirmLabel="Apagar cargo"
      />
    </Panel>
  );
};

export default KvRoles;
