import { useState } from "react";

import { adminRoleName, defaultTokenValidity, tokenValidityOptions } from "@assets/data";
import { createTokenSchema } from "@utils/validations/application";
import { applicationRoleOptions } from "@utils/functions";
import SecretReveal from "@components/secretReveal";
import { createToken } from "@actions/apps";
import useAppEditorPage from "../../hook";
import { Actions, Form } from "./styles";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Dialog from "@components/dialog";
import Select from "@components/select";
import Input from "@components/input";
import useForm from "@hooks/useForm";

import type { CreateTokenValues } from "@utils/types/application";

const initialValues = { name: "", validityDays: defaultTokenValidity, role: adminRoleName };

const validityOptions = tokenValidityOptions.map((option) => ({ value: String(option.value), label: option.label }));

const CreateTokenModal = () => {
  const { applicationId, application, isTokenModalOpen, handleCloseTokenModal, handleRefresh } = useAppEditorPage();
  const [rawToken, setRawToken] = useState<string | null>(null);

  const { execute } = useAction({
    action: (data: CreateTokenValues) => createToken(applicationId, data),
    toastMessages: { pending: "Gerando o token…", success: "Token gerado", error: "Não foi possível gerar o token" },
    callback: (created) => setRawToken(created.rawToken)
  });

  const { values, errors, isSubmitting, setFieldValue, handleChange, handleSubmit, reset } = useForm({
    schema: createTokenSchema,
    initialValues,
    onSubmit: execute
  });

  const handleDone = () => {
    if (rawToken) handleRefresh();
    setRawToken(null);
    reset();
    handleCloseTokenModal();
  };

  if (rawToken) {
    return (
      <Dialog
        isOpen={isTokenModalOpen}
        onClose={handleDone}
        eyebrow="Novo token"
        title="Token gerado"
        description="Copie agora: por segurança, o valor completo não aparece de novo."
      >
        <SecretReveal secret={rawToken} label="Token de acesso" confirmLabel="Já guardei o token" onConfirm={handleDone} />
      </Dialog>
    );
  }

  return (
    <Dialog
      isOpen={isTokenModalOpen}
      onClose={handleDone}
      eyebrow="Novo token"
      title="Gerar token de acesso"
      description="Cada cliente da API (site, app, script) deve ter o seu, para revogar um sem afetar os outros."
      maxWidth="480px"
    >
      <Form onSubmit={handleSubmit} noValidate>
        <Input
          label="Nome do token"
          name="name"
          placeholder="Site em produção"
          hint="Só para você reconhecer o token na lista."
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />
        <Select
          label="Validade"
          options={validityOptions}
          value={String(values.validityDays)}
          onValueChange={(value) => setFieldValue("validityDays", Number(value))}
          error={errors.validityDays}
        />
        <Select
          label="Cargo"
          options={applicationRoleOptions(application)}
          value={values.role}
          onValueChange={(value) => setFieldValue("role", value)}
          hint="O que este token pode fazer em cada coleção. Crie cargos na aba Cargos."
          error={errors.role}
        />
        <Actions>
          <Button variant="secondary" onClick={handleDone}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} loadingLabel="Gerando…">
            Gerar token
          </Button>
        </Actions>
      </Form>
    </Dialog>
  );
};

export default CreateTokenModal;
