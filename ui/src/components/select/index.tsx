import { Select as RadixSelect } from "@radix-ui/themes";
import { useId } from "react";

import { ActionItem, ActionLabel, Content, Control, Item, Separator, Trigger } from "./styles";
import { getFieldIds } from "@utils/functions";
import FormField from "@components/formField";

import type { SelectProps } from "./types";

const emptyValue = "__empty__";

const actionValue = "__action__";

const toItemValue = (value: string) => (value === "" ? emptyValue : value);

const fromItemValue = (value: string) => (value === emptyValue ? "" : value);

const Select = ({ label, options, value, onValueChange, name, id, placeholder, disabled, hint, error, action }: SelectProps) => {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const { describedBy } = getFieldIds(selectId, { hasHint: Boolean(hint), hasError: Boolean(error) });

  return (
    <FormField controlId={selectId} label={label} hint={hint} error={error}>
      <Control $hasError={Boolean(error)}>
        <RadixSelect.Root
          name={name}
          value={toItemValue(value)}
          disabled={disabled}
          onValueChange={(next) => {
            if (next === actionValue) {
              action?.onSelect();
              return;
            }
            onValueChange(fromItemValue(next));
          }}
        >
          <Trigger
            id={selectId}
            variant="ghost"
            placeholder={placeholder}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
          />
          <Content position="popper" sideOffset={6}>
            {options.map((option) => (
              <Item key={option.value} value={toItemValue(option.value)}>
                {option.label}
              </Item>
            ))}
            {action && (
              <>
                <Separator />
                <ActionItem value={actionValue}>
                  <ActionLabel>
                    {action.icon}
                    {action.label}
                  </ActionLabel>
                </ActionItem>
              </>
            )}
          </Content>
        </RadixSelect.Root>
      </Control>
    </FormField>
  );
};

export default Select;
