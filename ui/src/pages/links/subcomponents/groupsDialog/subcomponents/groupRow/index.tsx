import { CheckIcon, TrashIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import IconButton from "@components/iconButton";
import Input from "@components/input";
import { Row } from "./styles";

import type { GroupRowProps } from "./types";

const GroupRow = ({ group, isPending, onRename, onRemove }: GroupRowProps) => {
  const [name, setName] = useState(group.name);
  const trimmedName = name.trim();
  const canRename = trimmedName.length > 0 && trimmedName !== group.name;

  return (
    <Row>
      <Input
        label={`Nome do grupo ${group.name}`}
        isLabelHidden
        value={name}
        maxLength={60}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && canRename) onRename(trimmedName);
        }}
      />
      <IconButton
        label={`Salvar o nome de ${group.name}`}
        icon={<CheckIcon />}
        variant="secondary"
        disabled={!canRename || isPending}
        onClick={() => onRename(trimmedName)}
      />
      <IconButton
        label={`Excluir o grupo ${group.name}`}
        icon={<TrashIcon />}
        variant="danger"
        disabled={isPending}
        onClick={onRemove}
      />
    </Row>
  );
};

export default GroupRow;
