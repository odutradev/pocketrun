import { signUp } from "@actions/auth";
import Button from "@components/button";
import Input from "@components/input";
import useAction from "@hooks/useAction";
import useForm from "@hooks/useForm";
import useAuthStore from "@stores/auth";
import { signUpSchema } from "@utils/validations/auth";

import useAuthPage from "../../hook";
import { Form } from "./styles";

const RegisterForm: React.FC = () => {
  const { handleSuccess } = useAuthPage();
  const { setSession } = useAuthStore();
  const { execute } = useAction({
    action: signUp,
    toastMessages: { pending: "Criando conta…", success: "Conta criada", error: "Não foi possível criar a conta" },
    callback: (session) => {
      setSession(session);
      handleSuccess();
    }
  });
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
    schema: signUpSchema,
    initialValues: { name: "", email: "", password: "" },
    onSubmit: execute
  });

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Input
        label="Nome"
        name="name"
        size="lg"
        autoComplete="name"
        value={values.name}
        onChange={handleChange}
        error={errors.name}
      />
      <Input
        label="E-mail"
        name="email"
        type="email"
        size="lg"
        autoComplete="email"
        placeholder="voce@exemplo.com"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
      />
      <Input
        label="Senha"
        name="password"
        type="password"
        size="lg"
        autoComplete="new-password"
        hint="Mínimo de 8 caracteres, com letras e ao menos um número ou símbolo."
        value={values.password}
        onChange={handleChange}
        error={errors.password}
      />
      <Button type="submit" size="lg" isFullWidth isLoading={isSubmitting} loadingLabel="Criando conta…">
        Criar conta
      </Button>
    </Form>
  );
};

export default RegisterForm;
