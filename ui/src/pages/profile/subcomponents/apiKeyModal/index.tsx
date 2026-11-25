import { useState } from "react";

import { createApiKeySchema } from "@utils/validations/apiKey";
import SecretReveal from "@components/secretReveal";
import { apiKeyScopeOptions } from "@assets/data";
import { Actions, Form, Reveal } from "./styles";
import { createApiKey } from "@actions/auth";
import McpSetup from "@components/mcpSetup";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Dialog from "@components/dialog";
import Select from "@components/select";
import Input from "@components/input";
import useForm from "@hooks/useForm";

import type { ApiKeyScope, CreateApiKeyValues } from "@utils/types/apiKey";
import type { ApiKeyModalProps } from "./types";

const initialValues: CreateApiKeyValues = { name: "", scope: "write" };

const scopeOptions = apiKeyScopeOptions.map((option) => ({ value: option.value, label: option.label }));

const ApiKeyModal = ({ isOpen, onClose, onCreated }: ApiKeyModalProps) => {
  const [rawKey, setRawKey] = useState<string | null>(null);

  const { execute } = useAction({
    action: (data: CreateApiKeyValues) => createApiKey(data),
    toastMessages: { pending: "Gerando a chave…", success: "Chave gerada", error: "Não foi possível gerar a chave" },
    callback: (created) => {
      setRawKey(created.rawKey);
      onCreated();
    }
  });

  const { values, errors, isSubmitting, setFieldValue, handleChange, handleSubmit, reset } = useForm({
    schema: createApiKeySchema,
    initialValues,
    onSubmit: execute
  });

  const selectedScope = apiKeyScopeOptions.find((option) => option.value === values.scope);

  const handleDone = () => {
    setRawKey(null);
    reset();
    onClose();
  };

  if (rawKey) {
    return (
      <Dialog
        isOpen={isOpen}
        onClose={handleDone}
        eyebrow="Nova chave"
        title="Conecte a IA"
        description="A configuração abaixo já leva a chave. Copie agora: por segurança, a chave completa não aparece de novo."
        maxWidth="640px"
      >
        <Reveal>
          <McpSetup apiKey={rawKey} />
          <SecretReveal secret={rawKey} label="Chave de API" confirmLabel="Já guardei a chave" onConfirm={handleDone} />
        </Reveal>
      </Dialog>
    );
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleDone}
      eyebrow="Nova chave"
      title="Gerar chave de API"
      description="A chave deixa uma IA gerenciar o PocketRun por MCP, agindo em seu nome."
      maxWidth="480px"
    >
      <Form onSubmit={handleSubmit} noValidate>
        <Input
          label="Nome da chave"
          name="name"
          placeholder="Claude no notebook"
          hint="Só para você reconhecer a chave na lista."
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />
        <Select
          label="Permissão"
          options={scopeOptions}
          value={values.scope}
          onValueChange={(value) => setFieldValue("scope", value as ApiKeyScope)}
          hint={selectedScope?.description}
          error={errors.scope}
        />
        <Actions>
          <Button variant="secondary" onClick={handleDone}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} loadingLabel="Gerando…">
            Gerar chave
          </Button>
        </Actions>
      </Form>
    </Dialog>
  );
};

export default ApiKeyModal;
