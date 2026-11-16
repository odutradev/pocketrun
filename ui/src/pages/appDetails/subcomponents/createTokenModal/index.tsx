import { LockOpen1Icon } from "@radix-ui/react-icons";
import { Dialog, Select } from "@radix-ui/themes";
import { useId, useState } from "react";

import { createToken } from "@actions/apps";
import { defaultTokenValidity, tokenValidityOptions } from "@assets/data";
import Button from "@components/button";
import DialogHeader from "@components/dialogHeader";
import Input from "@components/input";
import SecretReveal from "@components/secretReveal";
import useAction from "@hooks/useAction";
import useForm from "@hooks/useForm";
import { createTokenSchema } from "@utils/validations/application";
import type { CreateTokenValues } from "@utils/validations/application";

import useAppDetailsPage from "../../hook";
import { Form, Label, SelectTrigger } from "./styles";

const initialValues = { name: "", validityDays: defaultTokenValidity };

const CreateTokenModal: React.FC = () => {
  const { applicationId, isTokenModalOpen, handleCloseTokenModal, handleRefresh } = useAppDetailsPage();
  const [rawToken, setRawToken] = useState<string | null>(null);
  const validityId = useId();

  const { execute } = useAction({
    action: (data: CreateTokenValues) => createToken(applicationId, data),
    toastMessages: { pending: "Gerando token...", success: "Token gerado!", error: "Erro ao gerar token" },
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

  return (
    <Dialog.Root open={isTokenModalOpen} onOpenChange={(isOpen) => !isOpen && handleDone()}>
      <Dialog.Content maxWidth="480px">
        <DialogHeader icon={<LockOpen1Icon />} label="Novo Token de Acesso" onClose={handleDone} />

        {rawToken ? (
          <SecretReveal
            icon={<LockOpen1Icon />}
            title="Token Criado com Sucesso!"
            description="Copie o token abaixo agora. Por motivos de segurança, você não poderá vê-lo novamente."
            secret={rawToken}
            confirmLabel="Fechar e Concluir"
            onConfirm={handleDone}
          />
        ) : (
          <>
            <Dialog.Title size="5" weight="bold" mb="1">
              Gerar Novo Token
            </Dialog.Title>
            <Dialog.Description size="2" color="gray" mb="4">
              Crie um novo token de autenticação (Bearer API Key) para conectar suas aplicações.
            </Dialog.Description>

            <Form onSubmit={handleSubmit} noValidate>
              <Input
                label="Identificador do Token"
                name="name"
                placeholder="ex: Backend Produção, Frontend Vercel"
                value={values.name}
                onChange={handleChange}
                error={errors.name}
                leftIcon={<LockOpen1Icon />}
              />
              <div>
                <Label as="label" size="2" weight="medium" mb="1" htmlFor={validityId}>
                  Validade do Token
                </Label>
                <Select.Root
                  value={String(values.validityDays)}
                  onValueChange={(value) => setFieldValue("validityDays", Number(value))}
                  size="3"
                >
                  <SelectTrigger id={validityId} />
                  <Select.Content position="popper">
                    {tokenValidityOptions.map((option) => (
                      <Select.Item key={option.value} value={String(option.value)}>
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>
              <Button type="submit" size="3" color="mint" variant="solid" loading={isSubmitting} mt="2" fullWidth>
                Gerar Token de Acesso
              </Button>
            </Form>
          </>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CreateTokenModal;
