import { LinkBreak2Icon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

import { Actions, Fields, Form, MappingGrid, MappingLabel, MappingRow, Section, SectionTitle } from "./styles";
import { createLocalLogger, previewSubjectOptions } from "@utils/functions";
import { Hint, Mono, Panel, PanelHeader, PanelTitle } from "../../styles";
import { removePageKv, setPageKv } from "@actions/sitePages";
import ConfirmDialog from "@components/confirmDialog";
import { listApplications } from "@actions/apps";
import usePageEditorPage from "../../../../hook";
import LinkButton from "@components/linkButton";
import { adminRoleName } from "@assets/data";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Select from "@components/select";
import Alert from "@components/alert";
import Badge from "@components/badge";

import type { Application, KvRole } from "@utils/types/application";
import type { PageKvDetails } from "@utils/types/sitePage";
import type { KvLinkValues } from "./types";

const logger = createLocalLogger("pageKvLink");

const noneValue = "__none";

const toValues = (details: PageKvDetails | null): KvLinkValues => ({
  applicationId: details?.binding?.applicationId ?? "",
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
  const [applications, setApplications] = useState<Application[]>([]);
  const [hasLoadedApplications, setHasLoadedApplications] = useState(false);
  const [values, setValues] = useState<KvLinkValues>(() => toValues(kv));
  const [isRemoving, setIsRemoving] = useState(false);
  const pageId = sitePage?.id ?? "";
  const keys = access?.keys ?? [];
  const linkedApplication = kv?.application ?? null;

  useEffect(() => {
    const controller = new AbortController();
    listApplications(controller.signal)
      .then((items) => setApplications(items))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) logger.error(error);
      })
      .finally(() => {
        if (!controller.signal.aborted) setHasLoadedApplications(true);
      });
    return () => controller.abort();
  }, []);

  const applicationOptions = [
    ...applications.map((application) => ({ value: application.id, label: `${application.name} · ${application.projectId}` })),
    ...(linkedApplication && !applications.some((application) => application.id === linkedApplication.id)
      ? [{ value: linkedApplication.id, label: `${linkedApplication.name} · ${linkedApplication.projectId}` }]
      : [])
  ];
  const selectedRoles =
    applications.find((application) => application.id === values.applicationId)?.roles ??
    (linkedApplication?.id === values.applicationId ? linkedApplication.roles : []);
  const options = roleOptions(selectedRoles);
  const subjects = previewSubjectOptions(access).filter((subject) => subject.value !== "public");

  const save = useAction({
    action: () =>
      setPageKv(pageId, {
        applicationId: values.applicationId,
        publicRole: fromOption(values.publicRole),
        roles: keys.map((key) => ({ pageRole: key.role, kvRole: fromOption(values.roles[key.role]) }))
      }),
    toastMessages: { pending: "Salvando o acesso aos dados…", success: "Acesso aos dados salvo", error: "Não foi possível salvar o acesso aos dados" },
    callback: handleKvChange
  });

  const remove = useAction({
    action: () => removePageKv(pageId),
    toastMessages: { pending: "Desligando o KV…", success: "Página desligada do KV", error: "Não foi possível desligar o KV" },
    callback: () => {
      setIsRemoving(false);
      setValues(toValues(null));
      handleKvChange({ binding: null, application: null });
    }
  });

  const handleApplicationChange = (applicationId: string) => {
    const roles = applications.find((application) => application.id === applicationId)?.roles ?? [];
    const keep = (role: string) => (role === noneValue || role === adminRoleName || roles.some((item) => item.name === role) ? role : noneValue);
    setValues((current) => ({
      applicationId,
      publicRole: keep(current.publicRole),
      roles: Object.fromEntries(Object.entries(current.roles).map(([pageRole, kvRole]) => [pageRole, keep(kvRole)]))
    }));
  };

  const isMissingApplication = Boolean(kv?.binding) && !linkedApplication;
  const usesAdmin = [values.publicRole, ...Object.values(values.roles)].includes(adminRoleName);

  return (
    <Panel aria-labelledby="kv-link-title">
      <PanelHeader>
        <PanelTitle id="kv-link-title">Dados do KV</PanelTitle>
        {kv?.binding ? <Badge tone="success" hasDot>Ligada</Badge> : <Badge>Desligada</Badge>}
      </PanelHeader>
      <Hint>
        Ligue uma aplicação do KV para a página ler e gravar dados com <Mono>pocketrun.kv</Mono>. Cada forma de abrir a página usa um cargo da
        aplicação, e o cargo decide o que pode ser feito em cada coleção.
      </Hint>
      {isMissingApplication && <Alert tone="warning">A aplicação ligada foi excluída. Escolha outra ou desligue o KV.</Alert>}
      {hasLoadedApplications && applicationOptions.length === 0 ? (
        <Alert tone="neutral" action={<LinkButton to="/kv/new">Criar aplicação</LinkButton>}>
          Você ainda não tem aplicações no KV.
        </Alert>
      ) : (
        <Form
          onSubmit={(event) => {
            event.preventDefault();
            save.execute();
          }}
        >
          <Fields>
            <Select
              label="Aplicação"
              placeholder={hasLoadedApplications ? "Escolha uma aplicação" : "Carregando as aplicações…"}
              options={applicationOptions}
              value={values.applicationId}
              onValueChange={handleApplicationChange}
              disabled={!hasLoadedApplications}
              hint="Só aparecem as aplicações que são suas."
            />
          </Fields>
          {values.applicationId && (
            <>
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
                  O cargo admin lê, grava e apaga em todas as coleções desta aplicação. Pela página, use de preferência um cargo com só as coleções
                  que ela precisa.
                </Alert>
              )}
            </>
          )}
          <Actions>
            {kv?.binding && (
              <Button variant="secondary" leftIcon={<LinkBreak2Icon />} onClick={() => setIsRemoving(true)}>
                Desligar o KV
              </Button>
            )}
            <Button type="submit" isLoading={save.isPending} loadingLabel="Salvando…" disabled={!values.applicationId}>
              {kv?.binding ? "Salvar" : "Ligar a aplicação"}
            </Button>
          </Actions>
        </Form>
      )}
      <ConfirmDialog
        isOpen={isRemoving}
        onClose={() => setIsRemoving(false)}
        onConfirm={() => remove.execute()}
        isPending={remove.isPending}
        title="Desligar o KV?"
        description="A página perde o acesso aos dados na hora: as chamadas de pocketrun.kv passam a falhar. Os documentos continuam na aplicação."
        confirmLabel="Desligar"
      />
    </Panel>
  );
};

export default KvLinkForm;
