import { EnvelopeClosedIcon, LockClosedIcon, PersonIcon, PlusIcon } from "@radix-ui/react-icons";

import { signUp } from "@actions/auth";
import Button from "@components/button";
import Input from "@components/input";
import useAction from "@hooks/useAction";
import useForm from "@hooks/useForm";
import useAuthStore from "@stores/auth";
import { signUpSchema } from "@utils/validations/auth";

import { Form } from "./styles";
import type { RegisterFormProps } from "./types";

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const { setSession } = useAuthStore();
  const { execute } = useAction({
    action: signUp,
    toastMessages: { pending: "Criando conta...", success: "Conta criada!", error: "Falha ao registrar" },
    callback: (session) => {
      setSession(session);
      onSuccess?.();
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
        label="Nome completo"
        name="name"
        placeholder="Seu nome"
        value={values.name}
        onChange={handleChange}
        error={errors.name}
        leftIcon={<PersonIcon />}
      />
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
        placeholder="No mínimo 8 caracteres"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
        leftIcon={<LockClosedIcon />}
      />
      <Button type="submit" variant="solid" color="mint" size="3" loading={isSubmitting} leftIcon={<PlusIcon />} mt="2">
        Criar Conta de Gestor
      </Button>
    </Form>
  );
};

export default RegisterForm;
