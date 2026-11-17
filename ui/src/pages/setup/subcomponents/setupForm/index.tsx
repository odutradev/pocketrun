import { ArrowRightIcon } from "@radix-ui/react-icons";

import Button from "@components/button";
import Input from "@components/input";

import useSetupPage from "../../hook";
import { Actions, Description, Form, Heading, Title } from "./styles";

const SetupForm = () => {
  const { form } = useSetupPage();
  const { values, errors, isSubmitting, handleChange, handleSubmit } = form;

  return (
    <Form onSubmit={handleSubmit} noValidate aria-labelledby="setup-title">
      <Heading>
        <Title id="setup-title">Crie o primeiro gestor</Title>
        <Description>Ele é dono das aplicações desta instância. Este passo só aparece uma vez.</Description>
      </Heading>
      <Input label="Nome" name="name" autoComplete="name" value={values.name} onChange={handleChange} error={errors.name} />
      <Input
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="gestor@exemplo.com"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
      />
      <Input
        label="Senha"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="Mínimo de 8 caracteres, com letras e ao menos um número ou símbolo."
        value={values.password}
        onChange={handleChange}
        error={errors.password}
      />
      <Input
        label="Confirme a senha"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
      />
      <Actions>
        <Button type="submit" isLoading={isSubmitting} loadingLabel="Criando…" rightIcon={<ArrowRightIcon />}>
          Criar gestor e continuar
        </Button>
      </Actions>
    </Form>
  );
};

export default SetupForm;
