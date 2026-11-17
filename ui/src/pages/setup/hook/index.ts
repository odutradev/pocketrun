import { useNavigate } from "react-router-dom";

import { createSuperadmin, getSetupStatus } from "@actions/setup";
import { setupSchema } from "@utils/validations/auth";
import useSystemStore from "@stores/system";
import useAction from "@hooks/useAction";
import useAuthStore from "@stores/auth";
import useForm from "@hooks/useForm";

import type { SetupValues } from "@utils/types/auth";
import type { UseSetupPageReturn } from "./types";



const initialValues = { name: "", email: "", password: "", confirmPassword: "" };

const useSetupPage = (): UseSetupPageReturn => {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();
  const { setSetupRequired } = useSystemStore();

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

  const submit = async (values: SetupValues) => {
    const session = await execute(values);
    if (session) return;
    const status = await getSetupStatus().catch(() => undefined);
    if (status) setSetupRequired(status.setupRequired);
  };

  const form = useForm({ schema: setupSchema, initialValues, onSubmit: submit });

  return { form };
};

export default useSetupPage;
