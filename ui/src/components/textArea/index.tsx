import { TextArea as RadixTextArea } from "@radix-ui/themes";
import { useId } from "react";

import { BlockText, Container } from "./styles";
import type { TextAreaProps } from "./types";

const TextArea: React.FC<TextAreaProps> = ({ label, hint, error, id, ...props }) => {
  const generatedId = useId();
  const textAreaId = id ?? generatedId;

  return (
    <Container>
      <BlockText as="label" size="2" weight="medium" mb="1" htmlFor={textAreaId}>
        {label}
      </BlockText>
      <RadixTextArea id={textAreaId} size="2" aria-invalid={Boolean(error)} {...props} />
      {hint && (
        <BlockText size="1" color="gray" mt="1">
          {hint}
        </BlockText>
      )}
      {error && (
        <BlockText size="1" color="red" mt="1">
          {error}
        </BlockText>
      )}
    </Container>
  );
};

export default TextArea;
