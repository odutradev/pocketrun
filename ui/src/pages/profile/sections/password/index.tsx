import { changePassword } from "@actions/auth";
import Button from "@components/button";
import Card from "@components/card";
import Input from "@components/input";
import SectionHeader from "@components/sectionHeader";
import useAction from "@hooks/useAction";
import useForm from "@hooks/useForm";
import { changePasswordSchema } from "@utils/validations/user";
import type { ChangePasswordValues } from "@utils/validations/user";

import { Actions, FieldRow, Form, Section } from "../../styles";

const initialValues = { currentPassword: "", newPassword: "", confirmPassword: "" };

// Troca de senha: pede a atual antes de aceitar a nova.
const PasswordSection = () => {
  const { execute } = useAction({
    action: ({ currentPassword, newPassword }: ChangePasswordValues) => changePassword({ currentPassword, newPassword }),
    toastMessages: { pending: "Trocando a senha…", success: "Senha alterada", error: "Não foi possível trocar a senha" },
    callback: () => reset()
  });

  const { values, errors, isSubmitting, handleChange, handleSubmit, reset } = useForm({
    schema: changePasswordSchema,
    initialValues,
    onSubmit: execute
  });

  return (
    <Card as="section" padding="lg" aria-labelledby="profile-password">
      <Section>
        <SectionHeader
          titleId="profile-password"
          title="Senha"
          description="No mínimo 8 caracteres, com uma letra e um número ou símbolo."
        />
        <Form onSubmit={handleSubmit} noValidate>
          <Input
            label="Senha atual"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            value={values.currentPassword}
            onChange={handleChange}
            error={errors.currentPassword}
          />
          <FieldRow>
            <Input
              label="Nova senha"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={values.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
            />
            <Input
              label="Confirme a nova senha"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
          </FieldRow>
          <Actions>
            <Button type="submit" variant="secondary" isLoading={isSubmitting} loadingLabel="Trocando…">
              Trocar senha
            </Button>
          </Actions>
        </Form>
      </Section>
    </Card>
  );
};

export default PasswordSection;
