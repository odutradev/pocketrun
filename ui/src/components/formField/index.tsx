import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { getFieldIds } from "@utils/functions";

import { Container, ErrorText, Hint, Label } from "./styles";
import type { FormFieldProps } from "./types";

// Rótulo acima, ajuda abaixo e erro abaixo dela. Os ids batem com os de `getFieldIds`,
// que o controle usa em `aria-describedby`.
const FormField: React.FC<FormFieldProps> = ({ controlId, label, isLabelHidden = false, hint, error, children }) => {
  const { hintId, errorId } = getFieldIds(controlId);

  return (
    <Container>
      {label && (
        <Label htmlFor={controlId} $isHidden={isLabelHidden}>
          {label}
        </Label>
      )}
      {children}
      {hint && <Hint id={hintId}>{hint}</Hint>}
      {error && (
        <ErrorText id={errorId}>
          <ExclamationTriangleIcon aria-hidden="true" />
          {error}
        </ErrorText>
      )}
    </Container>
  );
};

export default FormField;
