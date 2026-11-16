import { GlobeIcon, LockClosedIcon, PlusIcon } from "@radix-ui/react-icons";
import { Dialog } from "@radix-ui/themes";
import { useState } from "react";

import { createApplication } from "@actions/apps";
import Button from "@components/button";
import DialogHeader from "@components/dialogHeader";
import Input from "@components/input";
import SecretReveal from "@components/secretReveal";
import TextArea from "@components/textArea";
import useAction from "@hooks/useAction";
import useForm from "@hooks/useForm";
import { parseOrigins, toProjectId } from "@utils/functions";
import { createApplicationSchema } from "@utils/validations/application";
import type { CreateApplicationValues } from "@utils/validations/application";

import useHomePage from "../../hook";
import { Form } from "./styles";

const initialValues = { name: "", projectId: "", origins: "*", description: "" };

const CreateAppModal: React.FC = () => {
  const { isCreateModalOpen, handleCloseCreate, loadApplications } = useHomePage();
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
    toastMessages: { pending: "Criando aplicação...", success: "Aplicação criada!", error: "Erro ao criar aplicação" },
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

  return (
    <Dialog.Root open={isCreateModalOpen} onOpenChange={(isOpen) => !isOpen && handleDone()}>
      <Dialog.Content maxWidth="520px">
        <DialogHeader icon={<PlusIcon />} label="Nova Aplicação" onClose={handleDone} />

        {rawToken ? (
          <SecretReveal
            icon={<LockClosedIcon />}
            title="Aplicação Criada com Sucesso!"
            description="Abaixo está o seu Token de Acesso (API Key). Guarde-o em local seguro, pois ele não será exibido novamente."
            secret={rawToken}
            confirmLabel="Entendi e Salvei o Token"
            onConfirm={handleDone}
          />
        ) : (
          <>
            <Dialog.Title size="5" weight="bold" mb="1">
              Criar Aplicação
            </Dialog.Title>
            <Dialog.Description size="2" color="gray" mb="4">
              Configure os detalhes e as origens de acesso autorizadas para o seu novo projeto.
            </Dialog.Description>

            <Form onSubmit={handleSubmit} noValidate>
              <Input
                label="Nome da Aplicação"
                name="name"
                placeholder="ex: Meu E-Commerce, Blog Pessoal"
                value={values.name}
                onChange={(event) => handleNameChange(event.target.value)}
                error={errors.name}
              />
              <Input
                label="Project ID (Identificador Único)"
                name="projectId"
                placeholder="ex: meu-ecommerce-2026"
                value={values.projectId}
                onChange={(event) => setFieldValue("projectId", toProjectId(event.target.value))}
                error={errors.projectId}
              />
              <Input
                label="Origens Permitidas (CORS)"
                name="origins"
                placeholder="https://meusite.com, http://localhost:3000 ou *"
                value={values.origins}
                onChange={handleChange}
                error={errors.origins}
                leftIcon={<GlobeIcon />}
              />
              <TextArea
                label="Descrição (Opcional)"
                name="description"
                rows={2}
                placeholder="Aplicação web e mobile de pedidos..."
                value={values.description}
                onChange={handleChange}
                error={errors.description}
              />
              <Button type="submit" size="3" color="mint" variant="solid" loading={isSubmitting} mt="2" fullWidth>
                Criar Aplicação
              </Button>
            </Form>
          </>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CreateAppModal;
