import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import { Actions, AddField, AddRow, Divider, EmptyLine, FieldLabel, Form, Origin, OriginActions, OriginItem, OriginList, Switches } from "./styles";
import { originSchema, securitySettingsSchema } from "@utils/validations/application";
import { allowsAnyOrigin, isLocalOrigin } from "@utils/functions";
import SectionHeader from "@components/sectionHeader";
import { updateApplication } from "@actions/apps";
import SwitchField from "@components/switchField";
import IconButton from "@components/iconButton";
import useAppDetailsPage from "../../hook";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Alert from "@components/alert";
import Badge from "@components/badge";
import Input from "@components/input";
import useForm from "@hooks/useForm";
import Card from "@components/card";

import type { SecuritySettingsValues } from "@utils/validations/application";
import type { Application } from "@utils/types/application";
import type { KeyboardEvent } from "react";

const newOriginId = "security-new-origin";

const toFormValues = (application: Application | null): SecuritySettingsValues => ({
  origins: (application?.allowedOrigins ?? []).filter((origin) => origin !== "*"),
  allowAnyOrigin: allowsAnyOrigin(application?.allowedOrigins ?? ["*"]),
  allowNonBrowserRequests: application?.allowNonBrowserRequests ?? true
});

const SecurityTab = () => {
  const { application, handleRefresh } = useAppDetailsPage();
  const [newOrigin, setNewOrigin] = useState("");
  const [newOriginError, setNewOriginError] = useState<string | undefined>();
  const initialValues = toFormValues(application);

  const { execute } = useAction({
    action: ({ origins, allowAnyOrigin, allowNonBrowserRequests }: SecuritySettingsValues) =>
      updateApplication(application?.id ?? "", {
        name: application?.name ?? "",
        description: application?.description ?? "",
        allowedOrigins: allowAnyOrigin ? ["*"] : origins,
        allowNonBrowserRequests
      }),
    toastMessages: {
      pending: "Salvando…",
      success: "Configurações salvas",
      error: "Não foi possível salvar as configurações"
    },
    callback: handleRefresh
  });

  const { values, errors, isSubmitting, setFieldValue, handleSubmit, reset } = useForm({
    schema: securitySettingsSchema,
    initialValues,
    onSubmit: execute
  });

  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

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

  const handleDiscard = () => {
    reset();
    setNewOrigin("");
    setNewOriginError(undefined);
  };

  return (
    <Card as="section" aria-labelledby="security-title">
      <Form onSubmit={handleSubmit} noValidate>
        <SectionHeader
          titleId="security-title"
          title="Origens permitidas"
          description="Só estes sites podem chamar a API desta aplicação pelo navegador."
        />

        {values.allowAnyOrigin ? (
          <Alert tone="warning" title="Origem global ligada">
            Qualquer site pode chamar a API pelo navegador. Desligue abaixo para voltar a usar a lista.
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
                      <IconButton
                        size="sm"
                        label={`Remover ${origin}`}
                        icon={<Cross2Icon />}
                        onClick={() => handleRemoveOrigin(origin)}
                      />
                    </OriginActions>
                  </OriginItem>
                ))}
              </OriginList>
            )}

            <AddField>
              <FieldLabel htmlFor={newOriginId}>Nova origem</FieldLabel>
              <AddRow>
                <Input
                  id={newOriginId}
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
            </AddField>
          </>
        )}

        <Divider />

        <Switches>
          <SwitchField
            label="Origem global (*)"
            description="Libera qualquer site. Use só em protótipos."
            isChecked={values.allowAnyOrigin}
            onCheckedChange={(isChecked) => setFieldValue("allowAnyOrigin", isChecked)}
          />
          <SwitchField
            label="Chamadas fora do navegador"
            description="Apps mobile, scripts e servidores, que não enviam o header Origin."
            isChecked={values.allowNonBrowserRequests}
            onCheckedChange={(isChecked) => setFieldValue("allowNonBrowserRequests", isChecked)}
          />
        </Switches>

        <Actions>
          <Button variant="secondary" disabled={!isDirty || isSubmitting} onClick={handleDiscard}>
            Descartar
          </Button>
          <Button type="submit" disabled={!isDirty} isLoading={isSubmitting} loadingLabel="Salvando…">
            Salvar configurações
          </Button>
        </Actions>
      </Form>
    </Card>
  );
};

export default SecurityTab;
