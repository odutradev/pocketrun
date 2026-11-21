import { useState } from "react";

import Button from "@components/button";
import Dialog from "@components/dialog";
import Input from "@components/input";
import { Code } from "./styles";

import type { ConfirmDialogProps } from "./types";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  isPending = false,
  confirmationText,
  confirmationLabel = "Confirme digitando o Project ID"
}: ConfirmDialogProps) => {
  const [typedText, setTypedText] = useState("");
  const isConfirmed = !confirmationText || typedText.trim() === confirmationText;

  const handleClose = () => {
    setTypedText("");
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={description}
      maxWidth="480px"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="dangerSolid" disabled={!isConfirmed} isLoading={isPending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {confirmationText && (
        <Input
          label={confirmationLabel}
          hint={
            <>
              Digite <Code>{confirmationText}</Code> para liberar o botão.
            </>
          }
          isMono
          autoComplete="off"
          spellCheck={false}
          value={typedText}
          onChange={(event) => setTypedText(event.target.value)}
        />
      )}
    </Dialog>
  );
};

export default ConfirmDialog;
