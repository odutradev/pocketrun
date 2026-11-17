import { useId } from "react";

import { Description, Label, Row, Text, Thumb, Track } from "./styles";
import type { SwitchFieldProps } from "./types";

// Linha de configuração com rótulo visível, descrição e interruptor.
const SwitchField: React.FC<SwitchFieldProps> = ({
  label,
  description,
  isChecked,
  onCheckedChange,
  isDisabled = false
}) => {
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  return (
    <Row>
      <Text>
        <Label id={labelId}>{label}</Label>
        {description && <Description id={descriptionId}>{description}</Description>}
      </Text>
      <Track
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-labelledby={labelId}
        aria-describedby={description ? descriptionId : undefined}
        disabled={isDisabled}
        onClick={() => onCheckedChange(!isChecked)}
        $isChecked={isChecked}
      >
        <Thumb $isChecked={isChecked} />
      </Track>
    </Row>
  );
};

export default SwitchField;
