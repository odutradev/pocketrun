import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";

import { Email, NameCell, RowActions } from "./styles";
import IconButton from "@components/iconButton";
import { formatDate } from "@utils/functions";
import { roleLabels } from "@assets/data";
import Badge from "@components/badge";

import type { DataTableColumn } from "@components/dataTable/types";
import type { User } from "@utils/types/user";

interface UserColumnsOptions {
  currentUserId: string | undefined;
  onEdit: (user: User) => void;
  onRemove: (user: User) => void;
}

export const getUserColumns = ({ currentUserId, onEdit, onRemove }: UserColumnsOptions): DataTableColumn<User>[] => [
  {
    key: "name",
    header: "Nome",
    render: (user) => (
      <NameCell>
        {user.name}
        {user.id === currentUserId && <Badge tone="neutral">Você</Badge>}
      </NameCell>
    )
  },
  { key: "email", header: "E-mail", render: (user) => <Email>{user.email}</Email> },
  {
    key: "role",
    header: "Cargo",
    render: (user) => <Badge tone={user.role === "superadmin" ? "accent" : "neutral"}>{roleLabels[user.role]}</Badge>
  },
  { key: "createdAt", header: "Criado em", render: (user) => formatDate(user.createdAt) },
  {
    key: "actions",
    header: "Ações",
    isHeaderHidden: true,
    align: "right",
    render: (user) => (
      <RowActions>
        <IconButton label={`Editar ${user.name}`} icon={<Pencil1Icon />} size="sm" onClick={() => onEdit(user)} />
        {user.id !== currentUserId && (
          <IconButton
            label={`Remover ${user.name}`}
            icon={<TrashIcon />}
            size="sm"
            variant="danger"
            onClick={() => onRemove(user)}
          />
        )}
      </RowActions>
    )
  }
];
