import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";

import IconButton from "@components/iconButton";
import useClipboard from "@hooks/useClipboard";

import { Container, Value } from "./styles";
import type { CopyFieldProps } from "./types";

const CopyField = ({ value, label }: CopyFieldProps) => {
  const { copy, isCopied } = useClipboard();

  return (
    <Container>
      <Value>{value}</Value>
      <IconButton
        size="sm"
        variant="secondary"
        label={isCopied() ? `${label} copiado` : `Copiar ${label}`}
        icon={isCopied() ? <CheckIcon /> : <CopyIcon />}
        onClick={() => copy(value)}
      />
    </Container>
  );
};

export default CopyField;
