import { useState } from "react";

import { createApplicationSchema } from "@utils/validations/application";
import { parseOrigins, toProjectId } from "@utils/functions";
import SecretReveal from "@components/secretReveal";
import { createApplication } from "@actions/apps";
import TextArea from "@components/textArea";
import { Actions, Form } from "./styles";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Dialog from "@components/dialog";
import Input from "@components/input";
import useForm from "@hooks/useForm";
import useKvPage from "../../hook";

import type { CreateApplicationValues } from "@utils/types/application";

const initialValues = { name: "", projectId: "", origins: "*", description: "" };

const CreateAppModal = () => {
  const { isCreateModalOpen, handleCloseCreate, loadApplications } = useKvPage();
  const [rawToken, setRawToken] = useState<string | null>(null);

  const { execute } = useAction({
    action: ({ name, projectId, origins, description }: CreateApplicationValues) =>
      createApplication({
        name,
        projectId,
        description,
        allowedOrigins: parseOrigins(origins),
        allowNonBrowserRequests: true
      }),
    toastMessages: {
      pending: "Criando a aplicação…",
      success: "Aplicação criada",
      error: "Não foi possível criar a aplicação"
    },
    callback: (created) => setRawToken(created.rawToken)
  });

  const { values, errors, isSubmitting, setFieldValue, handleChange, handleSubmit, reset } = useForm({
    schema: createApplicationSchema,
    initialValues,
    onSubmit: execute
  });

  const handleNameChange = (name: string) => {
    setFieldValue("name", name);
    setFieldValue("projectId", toProjectId(name));
  };

  const handleDone = () => {
    if (rawToken) loadApplications();
    setRawToken(null);
    reset();
    handleCloseCreate();
  };

  if (rawToken) {
    return (
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={handleDone}
        eyebrow="Nova aplicação"
        title="Aplicação criada"
        description="Este é o primeiro token de acesso da aplicação. Os próximos você gera na aba Tokens."
      >
        <SecretReveal secret={rawToken} label="Token de acesso" confirmLabel="Já guardei o token" onConfirm={handleDone} />
      </Dialog>
    );
  }

  return (
    <Dialog
      isOpen={isCreateModalOpen}
      onClose={handleDone}
      eyebrow="Nova aplicação"
      title="Criar aplicação"
      description="Cada aplicação tem dados, tokens e origens próprios."
    >
      <Form onSubmit={handleSubmit} noValidate>
        <Input
          label="Nome"
          name="name"
          placeholder="Finanças pessoais"
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
          hint="Identificador único, usado pelos clientes da API. Só letras minúsculas, números e hífen."
          value={values.projectId}
          onChange={(event) => setFieldValue("projectId", toProjectId(event.target.value))}
          error={errors.projectId}
        />
        <Input
          label="Origens permitidas"
          name="origins"
          isMono
          spellCheck={false}
          placeholder="https://app.exemplo.com, http://localhost:5173"
          hint="Separe por vírgula. Com *, qualquer site pode chamar a API; dá para restringir depois em Segurança."
          value={values.origins}
          onChange={handleChange}
          error={errors.origins}
        />
        <TextArea
          label="Descrição (opcional)"
          name="description"
          rows={2}
          placeholder="Para que serve esta aplicação"
          value={values.description}
          onChange={handleChange}
          error={errors.description}
        />
        <Actions>
          <Button variant="secondary" onClick={handleDone}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} loadingLabel="Criando…">
            Criar aplicação
          </Button>
        </Actions>
      </Form>
    </Dialog>
  );
};

export default CreateAppModal;
