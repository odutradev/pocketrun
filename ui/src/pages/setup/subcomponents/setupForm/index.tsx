import { ArrowRightIcon, EnvelopeClosedIcon, LockClosedIcon, PersonIcon } from "@radix-ui/react-icons";

import Button from "@components/button";
import Input from "@components/input";

import useSetupPage from "../../hook";
import { Form } from "./styles";

const SetupForm: React.FC = () => {
  const { form } = useSetupPage();
  const { values, errors, isSubmitting, handleChange, handleSubmit } = form;

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Input
        label="Nome"
        name="name"
        placeholder="Ex: Administrador PocketRun"
        value={values.name}
        onChange={handleChange}
        error={errors.name}
        leftIcon={<PersonIcon />}
      />
      <Input
        label="E-mail"
        name="email"
        type="email"
        placeholder="admin@seudominio.com"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        leftIcon={<EnvelopeClosedIcon />}
      />
      <Input
        label="Senha"
        name="password"
        type="password"
        placeholder="Mínimo de 8 caracteres"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
        leftIcon={<LockClosedIcon />}
      />
      <Input
        label="Confirmar senha"
        name="confirmPassword"
        type="password"
        placeholder="Repita a senha digitada"
        value={values.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        leftIcon={<LockClosedIcon />}
      />
      <Button
        type="submit"
        variant="solid"
        color="mint"
        size="3"
        loading={isSubmitting}
        rightIcon={<ArrowRightIcon />}
        mt="2"
        fullWidth
      >
        Concluir Configuração e Entrar
      </Button>
    </Form>
  );
};

export default SetupForm;
