import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { TextField } from "@radix-ui/themes";
import { useId, useState } from "react";

import { Container, ErrorText, Label, ToggleButton } from "./styles";
import type { InputProps } from "./types";

const Input: React.FC<InputProps> = ({ label, error, leftIcon, type = "text", id, size = "2", ...props }) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = type === "password";
  const resolvedType = isPasswordField && isPasswordVisible ? "text" : type;

  return (
    <Container>
      {label && (
        <Label as="label" size="2" weight="medium" mb="1" htmlFor={inputId}>
          {label}
        </Label>
      )}

      <TextField.Root
        id={inputId}
        size={size}
        type={resolvedType}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...props}
      >
        {leftIcon && <TextField.Slot>{leftIcon}</TextField.Slot>}
        {isPasswordField && (
          <TextField.Slot side="right">
            <ToggleButton
              size="1"
              variant="ghost"
              color="gray"
              type="button"
              aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setIsPasswordVisible((current) => !current)}
            >
              {isPasswordVisible ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </ToggleButton>
          </TextField.Slot>
        )}
      </TextField.Root>

      {error && (
        <ErrorText id={errorId} size="1" color="red" mt="1">
          {error}
        </ErrorText>
      )}
    </Container>
  );
};

export default Input;
