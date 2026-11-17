import { updateProfile } from "@actions/auth";
import Button from "@components/button";
import Card from "@components/card";
import Input from "@components/input";
import SectionHeader from "@components/sectionHeader";
import useAction from "@hooks/useAction";
import useForm from "@hooks/useForm";
import { profileSchema } from "@utils/validations/user";

import useProfilePage from "../../hook";
import { Actions, FieldRow, Form, Section } from "../../styles";

// Nome e e-mail de acesso do próprio gestor.
const IdentitySection: React.FC = () => {
  const { user, handleUserUpdated } = useProfilePage();

  const { execute } = useAction({
    action: updateProfile,
    toastMessages: { pending: "Salvando o perfil…", success: "Perfil atualizado", error: "Não foi possível salvar o perfil" },
    callback: handleUserUpdated
  });

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
    schema: profileSchema,
    initialValues: { name: user?.name ?? "", email: user?.email ?? "" },
    onSubmit: execute
  });

  return (
    <Card as="section" padding="lg" aria-labelledby="profile-identity">
      <Section>
        <SectionHeader
          titleId="profile-identity"
          title="Dados da conta"
          description="O e-mail é o que você usa para entrar no painel."
        />
        <Form onSubmit={handleSubmit} noValidate>
          <FieldRow>
            <Input
              label="Nome"
              name="name"
              autoComplete="name"
              value={values.name}
              onChange={handleChange}
              error={errors.name}
            />
            <Input
              label="E-mail"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
            />
          </FieldRow>
          <Actions>
            <Button type="submit" isLoading={isSubmitting} loadingLabel="Salvando…">
              Salvar dados
            </Button>
          </Actions>
        </Form>
      </Section>
    </Card>
  );
};

export default IdentitySection;
