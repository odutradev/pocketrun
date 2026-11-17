import { useState } from "react";

import Button from "@components/button";
import Dialog from "@components/dialog";
import Input from "@components/input";

import { Code } from "./styles";
import type { ConfirmDialogProps } from "./types";

// Confirmação de ação destrutiva. O botão sólido de erro aparece só neste passo final.
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  isPending = false,
  confirmationText
}) => {
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
          label="Confirme digitando o Project ID"
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
