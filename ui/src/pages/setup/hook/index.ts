import { useNavigate } from "react-router-dom";

import { createSuperadmin, getSetupStatus, verifySetupToken } from "@actions/setup";
import { setupSchema, setupTokenSchema } from "@utils/validations/auth";
import useSystemStore from "@stores/system";
import useAction from "@hooks/useAction";
import useAuthStore from "@stores/auth";
import { isApiError } from "@utils/api";
import useForm from "@hooks/useForm";
import useSetupStore from "./store";

import type { SetupTokenValues, SetupValues } from "@utils/types/auth";
import type { UseSetupPageReturn } from "./types";

const initialValues = { name: "", email: "", password: "", confirmPassword: "" };
const initialTokenValues = { setupToken: "" };

const useSetupPage = (): UseSetupPageReturn => {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();
  const { setSetupRequired } = useSystemStore();
  const { setupToken, setSetupToken, clearSetupToken } = useSetupStore();

  const refreshStatus = async () => {
    const status = await getSetupStatus().catch(() => undefined);
    if (status) setSetupRequired(status.setupRequired);
  };

  const { execute: executeVerify } = useAction({
    action: async (values: SetupTokenValues) => {
      await verifySetupToken(values);
      return values.setupToken;
    },
    toastMessages: {
      pending: "Conferindo o token…",
      success: "Token confirmado",
      error: "Não foi possível conferir o token"
    },
    callback: setSetupToken
  });

  const { execute: executeCreate } = useAction({
    action: async ({ name, email, password }: SetupValues) => {
      try {
        return await createSuperadmin({ name, email, password, setupToken });
      } catch (error) {
        if (isApiError(error) && error.code === "invalid_setup_token") clearSetupToken();
        throw error;
      }
    },
    toastMessages: {
      pending: "Criando o primeiro gestor…",
      success: "Gestor criado. Tudo pronto.",
      error: "Não foi possível concluir o setup"
    },
    callback: (session) => {
      clearSetupToken();
      setSession(session);
      navigate("/");
    }
  });

  const submitToken = async (values: SetupTokenValues) => {
    const token = await executeVerify(values);
    if (token) return;
    await refreshStatus();
  };

  const submit = async (values: SetupValues) => {
    const session = await executeCreate(values);
    if (session) return;
    await refreshStatus();
  };

  const tokenForm = useForm({ schema: setupTokenSchema, initialValues: initialTokenValues, onSubmit: submitToken });
  const form = useForm({ schema: setupSchema, initialValues, onSubmit: submit });

  return { step: setupToken ? "admin" : "token", tokenForm, form, handleChangeToken: clearSetupToken };
};

export default useSetupPage;
