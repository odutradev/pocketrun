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
  edit: "Editar PIN"
};

const submitLabels: Record<PageAccessDialogMode, string> = {
  general: "Criar PIN",
  role: "Criar cargo",
  edit: "Salvar"
};

const isIssued = (result: PageAccess | PageAccessIssued): result is PageAccessIssued => "pin" in result;

const KeyDialog = ({ dialog, onClose, onPinChange }: KeyDialogProps) => {
  const { sitePage, handleAccessChange } = usePageEditorPage();
  const [pin, setPin] = useState<string | null>(null);
  const { mode, key } = dialog;
  const pageId = sitePage?.id ?? "";
  const isEdit = mode === "edit" && key !== null;
  const hasRole = mode === "role" || (isEdit && key.role !== "");
  const isPinOptional = isEdit && !key.isRevealable;

  const saveEdit = async (values: PageAccessKeyValues): Promise<PageAccess | PageAccessIssued | null> => {
    if (!key) return null;
    let result: PageAccess | PageAccessIssued | null = null;
    if (hasRole && values.role !== key.role) result = await renamePageAccessKey(pageId, key.id, values.role);
    if (values.pin !== "" && values.pin !== dialog.pin) result = await resetPageAccessPin(pageId, key.id, values.pin);
    return result;
  };

  const { execute } = useAction({
    action: (values: PageAccessKeyValues): Promise<PageAccess | PageAccessIssued | null> => {
      if (isEdit) return saveEdit(values);
      return createPageAccessKey(pageId, { role: mode === "role" ? values.role : "", pin: values.pin });
    },
    toastMessages: {
      pending: isEdit ? "Salvando…" : "Gerando o PIN…",
      success: isEdit ? "Alterações salvas" : "PIN pronto",
      error: isEdit ? "Não foi possível salvar as alterações" : "Não foi possível salvar o PIN"
    },
    callback: (result) => {
      if (!result) {
        onClose();
        return;
      }
      if (!isIssued(result)) {
        handleAccessChange(result);
        onClose();
        return;
      }
      handleAccessChange(result.access);
      if (isEdit) {
        onPinChange(key.id, result.pin);
        onClose();
        return;
      }
      setPin(result.pin);
    }
  });

  const { values, errors, isSubmitting, handleChange, setFieldValue, handleSubmit } = useForm({
    schema: pageAccessKeySchema,
    initialValues: { isRole: hasRole, hasPin: true, isPinOptional, role: key?.role ?? "", pin: dialog.pin },
    onSubmit: execute
  });

  if (pin) {
    const name = mode === "general" || !values.role ? "PIN geral" : values.role;
    return (
      <Dialog isOpen onClose={onClose} eyebrow={name} title="PIN pronto" description="Copie e envie para quem vai abrir a página. Você pode ver o PIN de novo na lista.">
        <SecretReveal secret={pin} label={name === "PIN geral" ? name : `PIN do cargo ${name}`} confirmLabel="Pronto" onConfirm={onClose} warning={null} />
      </Dialog>
    );
  }

  return (
    <Dialog
      isOpen
      onClose={onClose}
      eyebrow={key ? key.role || "PIN geral" : "Acesso"}
      title={titles[mode]}
      description={isEdit ? "Se trocar o PIN, o antigo para de funcionar e quem entrou com ele precisa digitar o novo." : undefined}
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
        <PinRow>
            <PinInput
              label="PIN"
              name="pin"
              length={pageAccessPinLength}
              hint={
                isPinOptional
                  ? "Este PIN foi criado antes de poder ser visto. Deixe vazio para manter ou digite um novo."
                  : "Digite os números ou gere um PIN no botão ao lado. Sequências e números repetidos não são aceitos."
              }
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
