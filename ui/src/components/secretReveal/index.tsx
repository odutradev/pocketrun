import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { Dialog } from "@radix-ui/themes";

import Button from "@components/button";
import useClipboard from "@hooks/useClipboard";

import { Container, IconCircle, SecretBox, SecretCode } from "./styles";
import type { SecretRevealProps } from "./types";

const SecretReveal: React.FC<SecretRevealProps> = ({ icon, title, description, secret, confirmLabel, onConfirm }) => {
  const { copy, isCopied } = useClipboard();

  return (
    <Container>
      <IconCircle>{icon}</IconCircle>
      <Dialog.Title size="5" weight="bold" mb="1">
        {title}
      </Dialog.Title>
      <Dialog.Description size="2" color="gray" mb="4">
        {description}
      </Dialog.Description>

      <SecretBox>
        <SecretCode size="2" color="grass">
          {secret}
        </SecretCode>
        <Button
          variant="soft"
          color={isCopied() ? "grass" : "gray"}
          size="2"
          onClick={() => copy(secret)}
          leftIcon={isCopied() ? <CheckIcon /> : <CopyIcon />}
        >
          {isCopied() ? "Copiado!" : "Copiar"}
        </Button>
      </SecretBox>

      <Button size="3" color="mint" variant="solid" onClick={onConfirm} fullWidth>
        {confirmLabel}
      </Button>
    </Container>
  );
};

export default SecretReveal;
