import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";

import IconButton from "@components/iconButton";
import useClipboard from "@hooks/useClipboard";

import { Container, Value } from "./styles";
import type { CopyFieldProps } from "./types";

// Valor de máquina em mono com botão de copiar ao lado.
const CopyField: React.FC<CopyFieldProps> = ({ value, label }) => {
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
