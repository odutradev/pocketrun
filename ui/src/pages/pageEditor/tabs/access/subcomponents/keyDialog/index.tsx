import { ShuffleIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import { createPageAccessKey, renamePageAccessKey, resetPageAccessPin } from "@actions/sitePages";
import { pageAccessKeySchema } from "@utils/validations/sitePage";
import { Actions, DiceSlot, Form, PinRow } from "./styles";
import { pageAccessPinLength } from "@assets/config";
import SecretReveal from "@components/secretReveal";
import usePageEditorPage from "../../../../hook";
import IconButton from "@components/iconButton";
import { randomPin } from "@utils/functions";
import PinInput from "@components/pinInput";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Dialog from "@components/dialog";
import Input from "@components/input";
import useForm from "@hooks/useForm";

import type { PageAccess, PageAccessDialogMode, PageAccessIssued, PageAccessKeyValues } from "@utils/types/sitePage";
import type { KeyDialogProps } from "./types";

const titles: Record<PageAccessDialogMode, string> = {
  general: "Criar PIN geral",
  role: "Novo cargo",
  rename: "Renomear cargo",
  reset: "Trocar PIN"
};

const submitLabels: Record<PageAccessDialogMode, string> = {
  general: "Criar PIN",
  role: "Criar cargo",
  rename: "Salvar nome",
  reset: "Trocar PIN"
};

const isIssued = (result: PageAccess | PageAccessIssued): result is PageAccessIssued => "pin" in result;

const KeyDialog = ({ dialog, onClose }: KeyDialogProps) => {
  const { sitePage, handleAccessChange } = usePageEditorPage();
  const [pin, setPin] = useState<string | null>(null);
  const { mode, key } = dialog;
  const pageId = sitePage?.id ?? "";
  const hasRole = mode === "role" || mode === "rename";
  const hasPin = mode !== "rename";

  const { execute } = useAction({
    action: (values: PageAccessKeyValues): Promise<PageAccess | PageAccessIssued> => {
      if (mode === "rename" && key) return renamePageAccessKey(pageId, key.id, values.role);
      if (mode === "reset" && key) return resetPageAccessPin(pageId, key.id, values.pin);
      return createPageAccessKey(pageId, { role: mode === "role" ? values.role : "", pin: values.pin });
    },
    toastMessages: {
      pending: mode === "rename" ? "Salvando o cargo…" : "Gerando o PIN…",
      success: mode === "rename" ? "Cargo renomeado" : "PIN pronto",
      error: mode === "rename" ? "Não foi possível renomear o cargo" : "Não foi possível salvar o PIN"
    },
    callback: (result) => {
      if (!isIssued(result)) {
        handleAccessChange(result);
        onClose();
        return;
      }
      handleAccessChange(result.access);
      setPin(result.pin);
    }
  });

  const { values, errors, isSubmitting, handleChange, setFieldValue, handleSubmit } = useForm({
    schema: pageAccessKeySchema,
    initialValues: { isRole: hasRole, hasPin, role: key?.role ?? "", pin: "" },
    onSubmit: execute
  });

  if (pin) {
    const name = mode === "general" || !values.role ? "PIN geral" : values.role;
    return (
      <Dialog isOpen onClose={onClose} eyebrow={name} title="PIN pronto" description="Copie e envie para quem vai abrir a página. Por segurança, o PIN não aparece de novo.">
        <SecretReveal secret={pin} label={`PIN de ${name}`} confirmLabel="Já guardei o PIN" onConfirm={onClose} />
      </Dialog>
    );
  }

  return (
    <Dialog
      isOpen
      onClose={onClose}
      eyebrow={key ? key.role || "PIN geral" : "Acesso"}
      title={titles[mode]}
      description={mode === "reset" ? "O PIN antigo para de funcionar e quem entrou com ele precisa digitar o novo." : undefined}
      maxWidth="440px"
    >
      <Form onSubmit={handleSubmit} noValidate>
        {hasRole && (
          <Input
            label="Nome do cargo"
            name="role"
            placeholder="gerente"
            hint="Letras minúsculas, números e hífen, como num slug. Aparece no histórico quando alguém entra."
            value={values.role}
            onChange={handleChange}
            error={errors.role}
            isMono
            autoFocus
          />
        )}
        {hasPin && (
          <PinRow>
            <PinInput
              label={mode === "reset" ? "Novo PIN" : "PIN"}
              name="pin"
              length={pageAccessPinLength}
              hint="Digite os números ou gere um PIN no botão ao lado. Sequências e números repetidos não são aceitos."
              value={values.pin}
              onChange={(pin) => setFieldValue("pin", pin)}
              error={errors.pin}
              autoFocus={!hasRole}
            />
            <DiceSlot>
              <IconButton
                label="Gerar um PIN aleatório"
                variant="secondary"
                icon={<ShuffleIcon />}
                onClick={() => setFieldValue("pin", randomPin(pageAccessPinLength))}
              />
            </DiceSlot>
          </PinRow>
        )}
        <Actions>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} loadingLabel="Salvando…">
            {submitLabels[mode]}
          </Button>
        </Actions>
      </Form>
    </Dialog>
  );
};

export default KeyDialog;
