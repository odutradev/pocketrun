import { useNavigate } from "react-router-dom";

import { createSuperadmin } from "@actions/setup";
import useAction from "@hooks/useAction";
import useForm from "@hooks/useForm";
import useAuthStore from "@stores/auth";
import { setupSchema } from "@utils/validations/auth";
import type { SetupValues } from "@utils/validations/auth";

import type { UseSetupPageReturn } from "./types";

const initialValues = { name: "", email: "", password: "", confirmPassword: "" };

const useSetupPage = (): UseSetupPageReturn => {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();

  const { execute } = useAction({
    action: ({ name, email, password }: SetupValues) => createSuperadmin({ name, email, password }),
    toastMessages: {
      pending: "Criando o primeiro gestor…",
      success: "Gestor criado. Tudo pronto.",
      error: "Não foi possível concluir o setup"
    },
    callback: (session) => {
      setSession(session);
      navigate("/");
    }
  });

  const form = useForm({ schema: setupSchema, initialValues, onSubmit: execute });

  return { form };
};

export default useSetupPage;
