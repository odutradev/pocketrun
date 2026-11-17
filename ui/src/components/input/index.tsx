import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { useId, useState } from "react";

import FormField from "@components/formField";
import IconButton from "@components/iconButton";
import { getFieldIds } from "@utils/functions";

import { Control, Field, Icon, Prefix, Trailing } from "./styles";
import type { InputProps } from "./types";

const Input = ({
  label,
  isLabelHidden,
  hint,
  error,
  leftIcon,
  prefix,
  isMono = false,
  size = "md",
  type = "text",
  id,
  ...props
}: InputProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const { describedBy } = getFieldIds(inputId, { hasHint: Boolean(hint), hasError: Boolean(error) });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = type === "password";

  return (
    <FormField controlId={inputId} label={label} isLabelHidden={isLabelHidden} hint={hint} error={error}>
      <Control $hasError={Boolean(error)} $isMono={isMono} $size={size}>
        {prefix && <Prefix aria-hidden="true">{prefix}</Prefix>}
        {leftIcon && <Icon aria-hidden="true">{leftIcon}</Icon>}
        <Field
          id={inputId}
          type={isPasswordField && isPasswordVisible ? "text" : type}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {isPasswordField && (
          <Trailing>
            <IconButton
              size="sm"
              label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
              icon={isPasswordVisible ? <EyeClosedIcon /> : <EyeOpenIcon />}
              onClick={() => setIsPasswordVisible((current) => !current)}
            />
          </Trailing>
        )}
      </Control>
    </FormField>
  );
};

export default Input;
