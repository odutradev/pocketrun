import { signIn } from "@actions/auth";
import Button from "@components/button";
import Input from "@components/input";
import useAction from "@hooks/useAction";
import useForm from "@hooks/useForm";
import useAuthStore from "@stores/auth";
import { signInSchema } from "@utils/validations/auth";

import useAuthPage from "../../hook";
import { Form } from "./styles";

const LoginForm: React.FC = () => {
  const { handleSuccess } = useAuthPage();
  const { setSession } = useAuthStore();
  const { execute } = useAction({
    action: signIn,
    toastMessages: { pending: "Entrando…", success: "Bem-vindo de volta", error: "Não foi possível entrar" },
    callback: (session) => {
      setSession(session);
      handleSuccess();
    }
  });
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
    schema: signInSchema,
    initialValues: { email: "", password: "" },
    onSubmit: execute
  });

  return (
    <Form onSubmit={handleSubmit} noValidate>
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
        autoComplete="current-password"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
      />
      <Button type="submit" size="lg" isFullWidth isLoading={isSubmitting} loadingLabel="Entrando…">
        Entrar
      </Button>
    </Form>
  );
};

export default LoginForm;
