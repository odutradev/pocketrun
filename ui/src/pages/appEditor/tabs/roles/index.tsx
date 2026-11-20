import { Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import { RoleActions, RoleDescription, RoleHeader, RoleItem, RoleList, RoleMain, RoleName, RuleList, RuleLine, Strong } from "./styles";
import { Column, Hint, Mono, Panel, PanelCount, PanelHeader, PanelTitle, Rules, SplitLayout } from "../../styles";
import { countRoleTokens, describeRoleRule } from "@utils/functions";
import ConfirmDialog from "@components/confirmDialog";
import IconButton from "@components/iconButton";
import { adminRoleName } from "@assets/data";
import { deleteRole } from "@actions/apps";
import useAppEditorPage from "../../hook";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Badge from "@components/badge";

import type { KvRole } from "@utils/types/application";

const describeTokens = (count: number): string => (count === 1 ? "1 token" : `${count} tokens`);

const RolesTab = () => {
  const { applicationId, application, handleRefresh, handleOpenRoleModal } = useAppEditorPage();
  const [roleToDelete, setRoleToDelete] = useState<KvRole | null>(null);
  const roles = application?.roles ?? [];
  const adminTokens = application ? countRoleTokens(application, adminRoleName) : 0;

  const { execute: removeRole, isPending } = useAction({
    action: (name: string) => deleteRole(applicationId, name),
    toastMessages: { pending: "Apagando o cargo…", success: "Cargo apagado", error: "Não foi possível apagar o cargo" },
    callback: () => {
      setRoleToDelete(null);
      handleRefresh();
    }
  });

  return (
    <SplitLayout>
      <Column>
        <Panel aria-labelledby="roles-title">
          <PanelHeader>
            <PanelTitle id="roles-title">
              Cargos
              <PanelCount>{roles.length + 1}</PanelCount>
            </PanelTitle>
            <Button size="sm" leftIcon={<PlusIcon />} onClick={() => handleOpenRoleModal(null)}>
              Novo cargo
            </Button>
          </PanelHeader>
          <RoleList>
            <RoleItem>
              <RoleMain>
                <RoleHeader>
                  <RoleName>{adminRoleName}</RoleName>
                  <Badge tone="accent">Acesso total</Badge>
                  <Badge>{describeTokens(adminTokens)}</Badge>
                </RoleHeader>
                <RoleDescription>
                  Lê, grava e apaga em todas as coleções, limpa coleções e exporta, importa ou apaga o projeto inteiro. Os tokens antigos usam este
                  cargo.
                </RoleDescription>
              </RoleMain>
            </RoleItem>
            {roles.map((role) => {
              const tokenCount = application ? countRoleTokens(application, role.name) : 0;
              return (
                <RoleItem key={role.name}>
                  <RoleMain>
                    <RoleHeader>
                      <RoleName>{role.name}</RoleName>
                      {role.isOwnDocumentsOnly && <Badge tone="warning">Só os próprios documentos</Badge>}
                      <Badge>{describeTokens(tokenCount)}</Badge>
                    </RoleHeader>
                    {role.description && <RoleDescription>{role.description}</RoleDescription>}
                    <RuleList>
                      {role.rules.map((rule) => (
                        <RuleLine key={rule.collection}>{describeRoleRule(rule)}</RuleLine>
                      ))}
                    </RuleList>
                  </RoleMain>
                  <RoleActions>
                    <IconButton size="sm" label={`Editar o cargo ${role.name}`} icon={<Pencil1Icon />} onClick={() => handleOpenRoleModal(role)} />
                    <IconButton
                      variant="danger"
                      size="sm"
                      label={`Apagar o cargo ${role.name}`}
                      icon={<TrashIcon />}
                      onClick={() => setRoleToDelete(role)}
                    />
                  </RoleActions>
                </RoleItem>
              );
            })}
          </RoleList>
        </Panel>
      </Column>
      <Column>
        <Panel>
          <PanelTitle>Como os cargos funcionam</PanelTitle>
          <Rules>
            <li>Cada token tem um cargo. O cargo diz em quais coleções o token pode ler, criar, editar e apagar; o resto é recusado com 403.</li>
            <li>
              Uma regra com <Mono>*</Mono> vale para todas as coleções sem regra própria. A regra com o nome da coleção sempre vence a do{" "}
              <Mono>*</Mono>.
            </li>
            <li>O limite de documentos barra novas gravações e importações quando a coleção chega ao número escolhido.</li>
            <li>
              Com <Strong>só os próprios documentos</Strong>, o cargo enxerga, edita e apaga apenas o que ele mesmo criou.
            </li>
            <li>Limpar coleções e exportar, importar ou apagar o projeto inteiro ficam só com o cargo admin.</li>
            <li>Trocar as regras vale na hora para todos os tokens e páginas que usam o cargo.</li>
          </Rules>
        </Panel>
        <Panel>
          <PanelTitle>Onde os cargos são usados</PanelTitle>
          <Hint>
            Escolha o cargo ao gerar um token ou troque na aba Tokens. Uma página do serviço de páginas ligada a esta aplicação também usa estes
            cargos, um para cada PIN, sem token nenhum no HTML.
          </Hint>
        </Panel>
      </Column>
      <ConfirmDialog
        isOpen={Boolean(roleToDelete)}
        onClose={() => setRoleToDelete(null)}
        onConfirm={() => roleToDelete && removeRole(roleToDelete.name)}
        isPending={isPending}
        title="Apagar cargo?"
        description={
          <>
            O cargo <Strong>{roleToDelete?.name}</Strong> sai da aplicação. Páginas ligadas a ele perdem o acesso aos dados na hora. Não dá para
            desfazer.
          </>
        }
        confirmLabel="Apagar cargo"
      />
    </SplitLayout>
  );
};

export default RolesTab;
