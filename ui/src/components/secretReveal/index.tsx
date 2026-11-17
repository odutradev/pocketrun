import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";

import Alert from "@components/alert";
import Button from "@components/button";
import useClipboard from "@hooks/useClipboard";

import { Container, Label, Secret, SecretBox } from "./styles";
import type { SecretRevealProps } from "./types";

// Segredo mostrado uma única vez: valor em mono, botão de copiar e o aviso de que ele não volta.
const SecretReveal = ({ secret, label, confirmLabel, onConfirm }: SecretRevealProps) => {
  const { copy, isCopied } = useClipboard();

  return (
    <Container>
      <SecretBox>
        <div>
          <Label>{label}</Label>
          <Secret>{secret}</Secret>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={isCopied() ? <CheckIcon /> : <CopyIcon />}
          onClick={() => copy(secret)}
        >
          {isCopied() ? "Copiado" : "Copiar"}
        </Button>
      </SecretBox>
      <Alert tone="warning">Guarde agora. Este valor não aparece de novo; depois, o painel mostra só o prefixo.</Alert>
      <Button isFullWidth size="lg" onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </Container>
  );
};

export default SecretReveal;
