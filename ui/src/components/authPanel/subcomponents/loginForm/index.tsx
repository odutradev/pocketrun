import { EnterIcon, EnvelopeClosedIcon, LockClosedIcon } from "@radix-ui/react-icons";

import { signIn } from "@actions/auth";
import Button from "@components/button";
import Input from "@components/input";
import useAction from "@hooks/useAction";
import useForm from "@hooks/useForm";
import useAuthStore from "@stores/auth";
import { signInSchema } from "@utils/validations/auth";

import { Form } from "./styles";
import type { LoginFormProps } from "./types";

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { setSession } = useAuthStore();
  const { execute } = useAction({
    action: signIn,
    toastMessages: { pending: "Entrando...", success: "Bem-vindo de volta!", error: "Falha ao autenticar" },
    callback: (session) => {
      setSession(session);
      onSuccess?.();
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
        placeholder="seu@email.com"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        leftIcon={<EnvelopeClosedIcon />}
      />
      <Input
        label="Senha"
        name="password"
        type="password"
        placeholder="••••••••"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
        leftIcon={<LockClosedIcon />}
      />
      <Button type="submit" variant="solid" color="mint" size="3" loading={isSubmitting} leftIcon={<EnterIcon />} mt="2">
        Entrar na Plataforma
      </Button>
    </Form>
  );
};

export default LoginForm;
