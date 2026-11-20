import { ExternalLinkIcon, LightningBoltIcon, LinkBreak2Icon } from "@radix-ui/react-icons";
import { useState } from "react";

import { Actions, Fields, Form, MappingGrid, MappingLabel, MappingRow, Section, SectionTitle } from "./styles";
import { enablePageKv, removePageKv, setPageKv } from "@actions/sitePages";
import { Hint, Mono, Panel, PanelHeader, PanelTitle, Rules } from "../../styles";
import ConfirmDialog from "@components/confirmDialog";
import { previewSubjectOptions } from "@utils/functions";
import usePageEditorPage from "../../../../hook";
import LinkButton from "@components/linkButton";
import { adminRoleName } from "@assets/data";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Select from "@components/select";
import Alert from "@components/alert";
import Badge from "@components/badge";

import type { PageKvDetails } from "@utils/types/sitePage";
import type { KvRole } from "@utils/types/application";
import type { KvLinkValues } from "./types";

const noneValue = "__none";

const toValues = (details: PageKvDetails | null): KvLinkValues => ({
  publicRole: details?.binding?.publicRole || noneValue,
  roles: Object.fromEntries((details?.binding?.roles ?? []).map((mapping) => [mapping.pageRole, mapping.kvRole || noneValue]))
});

const roleOptions = (roles: KvRole[]) => [
  { value: noneValue, label: "Sem acesso aos dados" },
  { value: adminRoleName, label: "admin · acesso total" },
  ...roles.map((role) => ({ value: role.name, label: role.description ? `${role.name} · ${role.description}` : role.name }))
];

const fromOption = (value: string | undefined): string => (!value || value === noneValue ? "" : value);

const KvLinkForm = () => {
  const { sitePage, kv, access, handleKvChange } = usePageEditorPage();
  const [values, setValues] = useState<KvLinkValues>(() => toValues(kv));
  const [isRemoving, setIsRemoving] = useState(false);
  const pageId = sitePage?.id ?? "";
  const keys = access?.keys ?? [];
  const linkedApplication = kv?.application ?? null;
  const isLinked = Boolean(kv?.binding);

  const options = roleOptions(linkedApplication?.roles ?? []);
  const subjects = previewSubjectOptions(access).filter((subject) => subject.value !== "public");

  const enable = useAction({
    action: () => enablePageKv(pageId),
    toastMessages: { pending: "Ativando os dados…", success: "Dados ativados", error: "Não foi possível ativar os dados" },
    callback: (details: PageKvDetails) => {
      setValues(toValues(details));
      handleKvChange(details);
    }
  });

  const save = useAction({
    action: () =>
      setPageKv(pageId, {
        publicRole: fromOption(values.publicRole),
        roles: keys.map((key) => ({ pageRole: key.role, kvRole: fromOption(values.roles[key.role]) }))
      }),
    toastMessages: { pending: "Salvando o acesso aos dados…", success: "Acesso aos dados salvo", error: "Não foi possível salvar o acesso aos dados" },
    callback: handleKvChange
  });

  const remove = useAction({
    action: () => removePageKv(pageId),
    toastMessages: { pending: "Desativando os dados…", success: "Dados desativados", error: "Não foi possível desativar os dados" },
    callback: () => {
      setIsRemoving(false);
      handleKvChange({ binding: null, application: null });
    }
  });

  const usesAdmin = [values.publicRole, ...Object.values(values.roles)].includes(adminRoleName);
  const isLegacy = Boolean(linkedApplication) && !linkedApplication?.pageId;

  if (!isLinked) {
    return (
      <Panel aria-labelledby="kv-link-title">
        <PanelHeader>
          <PanelTitle id="kv-link-title">Dados do KV</PanelTitle>
          <Badge>Desativados</Badge>
        </PanelHeader>
        <Hint>
          Ative para a página ler e gravar dados com <Mono>pocketrun.kv</Mono>. A página ganha uma aplicação do KV só dela, já configurada:
        </Hint>
        <Rules>
          <li>
            Três cargos prontos para todas as coleções: <strong>leitura</strong> (só lê), <strong>escrita</strong> (lê, cria e edita) e{" "}
            <strong>gestao</strong> (também apaga).
          </li>
          <li>Quem abre sem PIN fica com leitura. O PIN geral e cada PIN da aba Acesso ficam com escrita.</li>
          <li>Nenhum token é criado: os dados só são usados pela página, até você criar um token no KV.</li>
          <li>Os cargos podem ser trocados aqui, e as regras de cada cargo editadas no KV.</li>
        </Rules>
        <Actions>
          <Button leftIcon={<LightningBoltIcon />} onClick={() => enable.execute()} isLoading={enable.isPending} loadingLabel="Ativando…" disabled={!pageId}>
            Ativar dados
          </Button>
        </Actions>
      </Panel>
    );
  }

  return (
    <Panel aria-labelledby="kv-link-title">
      <PanelHeader>
        <PanelTitle id="kv-link-title">Dados do KV</PanelTitle>
        <Badge tone="success" hasDot>
          Ativados
        </Badge>
      </PanelHeader>
      <Hint>
        Cada forma de abrir a página usa um cargo da aplicação de dados, e o cargo decide o que pode ser feito em cada coleção.
      </Hint>
      {!linkedApplication && <Alert tone="warning">A aplicação de dados desta página foi excluída. Desative e ative de novo para criar outra.</Alert>}
      {isLegacy && (
        <Alert tone="neutral">
          Esta página usa uma aplicação comum do KV, ligada antes de existir a aplicação própria. Desative e ative de novo para a página ganhar a
          dela.
        </Alert>
      )}
      {linkedApplication && (
        <Form
          onSubmit={(event) => {
            event.preventDefault();
            save.execute();
          }}
        >
          <Fields>
            <Section>
              <SectionTitle>Aplicação</SectionTitle>
              <Hint>
                {linkedApplication.name} · <Mono>{linkedApplication.projectId}</Mono>
              </Hint>
              <LinkButton to={`/kv/${linkedApplication.id}/edit`} leftIcon={<ExternalLinkIcon />}>
                Ver dados e cargos no KV
              </LinkButton>
            </Section>
          </Fields>
          <Section>
            <SectionTitle>Quem abre sem PIN</SectionTitle>
            <Select
              label="Cargo de quem abre a página sem PIN"
              isLabelHidden
              options={options}
              value={values.publicRole}
              onValueChange={(publicRole) => setValues((current) => ({ ...current, publicRole }))}
              hint={
                access?.isEnabled
                  ? "A proteção por PIN está ligada: este cargo só vale se ela for desligada."
                  : "Vale para qualquer pessoa com o endereço. Prefira um cargo só de leitura, ou com só os próprios documentos."
              }
            />
          </Section>
          <Section>
            <SectionTitle>Cargo por PIN</SectionTitle>
            {subjects.length === 0 ? (
              <Hint>Crie PINs na aba Acesso para dar a cada pessoa ou equipe um cargo diferente.</Hint>
            ) : (
              <MappingGrid>
                {subjects.map((subject) => {
                  const pageRole = subject.value === "pin" ? "" : subject.value.slice("role:".length);
                  return (
                    <MappingRow key={subject.value}>
                      <MappingLabel>{subject.label}</MappingLabel>
                      <Select
                        label={`Cargo do KV para ${subject.label}`}
                        isLabelHidden
                        size="sm"
                        options={options}
                        value={values.roles[pageRole] ?? noneValue}
                        onValueChange={(kvRole) => setValues((current) => ({ ...current, roles: { ...current.roles, [pageRole]: kvRole } }))}
                      />
                    </MappingRow>
                  );
                })}
              </MappingGrid>
            )}
          </Section>
          {usesAdmin && (
            <Alert tone="warning">
              O cargo admin lê, grava e apaga em todas as coleções da aplicação. Pela página, use de preferência um cargo com só as coleções que ela
              precisa.
            </Alert>
          )}
          <Actions>
            <Button variant="secondary" leftIcon={<LinkBreak2Icon />} onClick={() => setIsRemoving(true)}>
              Desativar dados
            </Button>
            <Button type="submit" isLoading={save.isPending} loadingLabel="Salvando…">
              Salvar
            </Button>
          </Actions>
        </Form>
      )}
      {!linkedApplication && (
        <Actions>
          <Button variant="secondary" leftIcon={<LinkBreak2Icon />} onClick={() => setIsRemoving(true)}>
            Desativar dados
          </Button>
        </Actions>
      )}
      <ConfirmDialog
        isOpen={isRemoving}
        onClose={() => setIsRemoving(false)}
        onConfirm={() => remove.execute()}
        isPending={remove.isPending}
        title="Desativar os dados?"
        description="A página perde o acesso aos dados na hora: as chamadas de pocketrun.kv passam a falhar. Os documentos e os cargos continuam na aplicação da página e voltam ao ativar de novo. Eles só são apagados junto com a página."
        confirmLabel="Desativar"
      />
    </Panel>
  );
};

export default KvLinkForm;
