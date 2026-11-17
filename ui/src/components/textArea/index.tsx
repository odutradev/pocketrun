import { useId } from "react";

import FormField from "@components/formField";
import { getFieldIds } from "@utils/functions";

import { Field } from "./styles";
import type { TextAreaProps } from "./types";

const TextArea = ({ label, hint, error, isMono = false, id, ...props }: TextAreaProps) => {
  const generatedId = useId();
  const textAreaId = id ?? generatedId;
  const { describedBy } = getFieldIds(textAreaId, { hasHint: Boolean(hint), hasError: Boolean(error) });

  return (
    <FormField controlId={textAreaId} label={label} hint={hint} error={error}>
      <Field
        id={textAreaId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        $hasError={Boolean(error)}
        $isMono={isMono}
        {...props}
      />
    </FormField>
  );
};

export default TextArea;
