import { CheckIcon } from "@radix-ui/react-icons";
import { Checkbox, Code, Heading, Text } from "@radix-ui/themes";
import { useId } from "react";

import { updateApplication } from "@actions/apps";
import Button from "@components/button";
import Card from "@components/card";
import TextArea from "@components/textArea";
import useAction from "@hooks/useAction";
import useForm from "@hooks/useForm";
import { parseOrigins } from "@utils/functions";
import type { Application } from "@utils/types/application";
import { securitySettingsSchema } from "@utils/validations/application";
import type { SecuritySettingsValues } from "@utils/validations/application";

import useAppDetailsPage from "../../hook";
import { CheckboxLabel, CheckboxRow, Form } from "./styles";

const toFormValues = (application: Application | null): SecuritySettingsValues => ({
  origins: application?.allowedOrigins.join(", ") ?? "*",
  allowNonBrowserRequests: application?.allowNonBrowserRequests ?? true
});

const SecurityTab: React.FC = () => {
  const { application, handleRefresh } = useAppDetailsPage();
  const checkboxId = useId();

  const { execute } = useAction({
    action: ({ origins, allowNonBrowserRequests }: SecuritySettingsValues) =>
      updateApplication(application?.id ?? "", {
        name: application?.name ?? "",
        description: application?.description ?? "",
        allowedOrigins: parseOrigins(origins),
        allowNonBrowserRequests
      }),
    toastMessages: {
      pending: "Salvando configurações...",
      success: "Configurações atualizadas com sucesso!",
      error: "Falha ao salvar configurações"
    },
    callback: handleRefresh
  });

  const { values, isSubmitting, setFieldValue, handleChange, handleSubmit } = useForm({
    schema: securitySettingsSchema,
    initialValues: toFormValues(application),
    onSubmit: execute
  });

  return (
    <Card size="3">
      <Heading size="4" weight="bold" mb="1">
        Configurações de Segurança e Origens
      </Heading>
      <Text as="p" size="2" color="gray" mb="4">
        Restrinja quais domínios podem enviar requisições do navegador para os endpoints deste projeto.
      </Text>

      <Form onSubmit={handleSubmit} noValidate>
        <TextArea
          label="Origens Permitidas (CORS)"
          name="origins"
          rows={3}
          placeholder="https://exemplo.com, http://localhost:3000, *"
          value={values.origins}
          onChange={handleChange}
          hint={
            <>
              Separe os endereços autorizados por vírgula. Use <Code size="1">*</Code> para liberar requisições de
              qualquer frontend.
            </>
          }
        />

        <CheckboxRow>
          <Checkbox
            id={checkboxId}
            checked={values.allowNonBrowserRequests}
            onCheckedChange={(checked) => setFieldValue("allowNonBrowserRequests", checked === true)}
          />
          <CheckboxLabel as="label" size="2" htmlFor={checkboxId}>
            Permitir requisições que não venham de navegadores (ex: cURL, Insomnia, scripts backend ou mobile)
          </CheckboxLabel>
        </CheckboxRow>

        <div>
          <Button type="submit" variant="solid" color="mint" size="2" loading={isSubmitting} leftIcon={<CheckIcon />}>
            Salvar Alterações
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default SecurityTab;
