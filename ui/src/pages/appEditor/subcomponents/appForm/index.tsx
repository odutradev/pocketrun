import { Cross2Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import { ActionGroup, Actions, AddRow, Divider, EmptyLine, Form, Legend, Origin, OriginActions, OriginItem, OriginList, Pair, Section, SectionHint } from "./styles";
import { createApplication, deleteApplication, updateApplication } from "@actions/apps";
import { applicationFormSchema, originSchema } from "@utils/validations/application";
import { allowsAnyOrigin, isLocalOrigin, toProjectId } from "@utils/functions";
import ConfirmDialog from "@components/confirmDialog";
import SecretReveal from "@components/secretReveal";
import SwitchField from "@components/switchField";
import IconButton from "@components/iconButton";
import LinkButton from "@components/linkButton";
import TextArea from "@components/textArea";
import useAppEditorPage from "../../hook";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Dialog from "@components/dialog";
import Alert from "@components/alert";
import Badge from "@components/badge";
import Input from "@components/input";
import useForm from "@hooks/useForm";

import type { Application, ApplicationFormValues, CreatedApplication } from "@utils/types/application";
import type { AppFormProps, AppFormResult } from "./types";
import type { KeyboardEvent } from "react";

const toFormValues = (application: Application | null): ApplicationFormValues => ({
  name: application?.name ?? "",
  projectId: application?.projectId ?? "",
  description: application?.description ?? "",
  origins: (application?.allowedOrigins ?? []).filter((origin) => origin !== "*"),
  allowAnyOrigin: allowsAnyOrigin(application?.allowedOrigins ?? ["*"]),
  allowNonBrowserRequests: application?.allowNonBrowserRequests ?? true
});

const AppForm = ({ application }: AppFormProps) => {
  const { handleCreated, handleRemoved, handleRefresh } = useAppEditorPage();
  const [newOrigin, setNewOrigin] = useState("");
  const [newOriginError, setNewOriginError] = useState<string | undefined>();
  const [created, setCreated] = useState<CreatedApplication | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const { execute } = useAction({
    action: async ({ name, projectId, description, origins, allowAnyOrigin, allowNonBrowserRequests }: ApplicationFormValues): Promise<AppFormResult> => {
      const allowedOrigins = allowAnyOrigin ? ["*"] : origins;
      if (!application) return createApplication({ name, projectId, description, allowedOrigins, allowNonBrowserRequests });
      await updateApplication(application.id, { name, description, allowedOrigins, allowNonBrowserRequests });
      return null;
    },
    toastMessages: {
      pending: application ? "Salvando a aplicação…" : "Criando a aplicação…",
      success: application ? "Aplicação atualizada" : "Aplicação criada",
      error: application ? "Não foi possível salvar a aplicação" : "Não foi possível criar a aplicação"
    },
    callback: (result) => {
      if (result) {
        setCreated(result);
        return;
      }
      handleRefresh();
    }
  });

  const remove = useAction({
    action: () => deleteApplication(application?.id ?? ""),
    toastMessages: { pending: "Excluindo a aplicação…", success: "Aplicação excluída", error: "Não foi possível excluir a aplicação" },
    callback: handleRemoved
  });

  const { values, errors, isSubmitting, setFieldValue, handleChange, handleSubmit } = useForm({
    schema: applicationFormSchema,
    initialValues: toFormValues(application),
    onSubmit: execute
  });

  const handleNameChange = (name: string) => {
    setFieldValue("name", name);
    if (!application) setFieldValue("projectId", toProjectId(name));
  };

  const handleAddOrigin = () => {
    const parsed = originSchema.safeParse(newOrigin);
    if (!parsed.success) return setNewOriginError(parsed.error.issues[0]?.message);
    if (values.origins.includes(parsed.data)) return setNewOriginError("Essa origem já está na lista");
    setFieldValue("origins", [...values.origins, parsed.data]);
    setNewOrigin("");
    setNewOriginError(undefined);
  };

  const handleNewOriginKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleAddOrigin();
  };

  const handleRemoveOrigin = (origin: string) =>
    setFieldValue(
      "origins",
      values.origins.filter((current) => current !== origin)
    );

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Section>
        <Legend>Aplicação</Legend>
        <Pair>
          <Input
            label="Nome"
            name="name"
            autoComplete="off"
            placeholder="Finanças pessoais"
            hint="Só aparece no painel, para você achar a aplicação."
            value={values.name}
            onChange={(event) => handleNameChange(event.target.value)}
            error={errors.name}
          />
          <Input
            label="Project ID"
            name="projectId"
            isMono
            spellCheck={false}
            placeholder="financas-pessoais"
            disabled={Boolean(application)}
            hint={
              application
                ? "Fixo depois de criado. A API devolve esse valor no header projectID."
                : "Identificador único. Só letras minúsculas, números e hífen."
            }
            value={values.projectId}
            onChange={(event) => setFieldValue("projectId", toProjectId(event.target.value))}
            error={errors.projectId}
          />
        </Pair>
        <TextArea
          label="Descrição *"
          name="description"
          rows={2}
          placeholder="Para que serve esta aplicação"
          value={values.description}
          onChange={handleChange}
          error={errors.description}
        />
      </Section>
      <Section>
        <Legend>Origens permitidas</Legend>
        <SectionHint>
          Só estes sites podem chamar a API desta aplicação pelo navegador. A lista vale para navegadores: um script fora deles manda a origem que
          quiser, então quem tem o token chega aos dados de qualquer jeito.
        </SectionHint>
        <SwitchField
          label="Origem global (*)"
          description="Libera qualquer site. Use só em protótipos."
          isChecked={values.allowAnyOrigin}
          onCheckedChange={(isChecked) => setFieldValue("allowAnyOrigin", isChecked)}
        />
        {values.allowAnyOrigin ? (
          <Alert tone="warning" title="Origem global ligada">
            Qualquer site pode chamar a API pelo navegador. Desligue para usar a lista de origens.
          </Alert>
        ) : (
          <>
            {values.origins.length === 0 ? (
              <EmptyLine>Nenhuma origem na lista.</EmptyLine>
            ) : (
              <OriginList aria-label="Origens na lista">
                {values.origins.map((origin) => (
                  <OriginItem key={origin}>
                    <Origin>{origin}</Origin>
                    <OriginActions>
                      {isLocalOrigin(origin) && <Badge>desenvolvimento</Badge>}
                      <IconButton size="sm" label={`Remover ${origin}`} icon={<Cross2Icon />} onClick={() => handleRemoveOrigin(origin)} />
                    </OriginActions>
                  </OriginItem>
                ))}
              </OriginList>
            )}
            <AddRow>
              <Input
                label="Nova origem"
                isMono
                spellCheck={false}
                placeholder="https://app.exemplo.com"
                value={newOrigin}
                onChange={(event) => setNewOrigin(event.target.value)}
                onKeyDown={handleNewOriginKeyDown}
                error={newOriginError ?? errors.origins}
              />
              <Button variant="secondary" leftIcon={<PlusIcon />} onClick={handleAddOrigin}>
                Adicionar
              </Button>
            </AddRow>
          </>
        )}
        <Divider />
        <SwitchField
          label="Chamadas fora do navegador"
          description="Apps mobile, scripts e servidores, que não enviam o header Origin."
          isChecked={values.allowNonBrowserRequests}
          onCheckedChange={(isChecked) => setFieldValue("allowNonBrowserRequests", isChecked)}
        />
      </Section>
      <Actions>
        {application && (
          <Button type="button" variant="danger" leftIcon={<TrashIcon />} onClick={() => setIsRemoving(true)}>
            Excluir aplicação
          </Button>
        )}
        <ActionGroup>
          <LinkButton to="/kv">Cancelar</LinkButton>
          <Button type="submit" isLoading={isSubmitting} loadingLabel={application ? "Salvando…" : "Criando…"}>
            {application ? "Salvar alterações" : "Criar aplicação"}
          </Button>
        </ActionGroup>
      </Actions>
      {application && (
        <ConfirmDialog
          isOpen={isRemoving}
          onClose={() => setIsRemoving(false)}
          onConfirm={() => remove.execute()}
          title="Excluir aplicação"
          description={
            <>
              {application.name} e tudo o que pertence a ela (coleções, documentos e tokens) são apagados de vez, e os clientes que usam os
              tokens dela param de funcionar na hora. Esta ação não pode ser desfeita.
            </>
          }
          confirmLabel="Excluir aplicação"
          confirmationText={application.projectId}
          isPending={remove.isPending}
        />
      )}
      {created && (
        <Dialog
          isOpen
          onClose={() => handleCreated(created.application)}
          eyebrow="Nova aplicação"
          title="Aplicação criada"
          description="Este é o primeiro token de acesso da aplicação. Os próximos você gera na aba Tokens."
        >
          <SecretReveal
            secret={created.rawToken}
            label="Token de acesso"
            confirmLabel="Já guardei o token"
            onConfirm={() => handleCreated(created.application)}
          />
        </Dialog>
      )}
    </Form>
  );
};

export default AppForm;
