import { ExitIcon } from "@radix-ui/react-icons";
import { DropdownMenu } from "@radix-ui/themes";

import Badge from "@components/badge";
import useAuthStore from "@stores/auth";
import { getInitial } from "@utils/functions";

import { Content, Email, Identity, Name, Trigger } from "./styles";
import type { UserMenuProps } from "./types";

const roleLabels = { superadmin: "Superadmin", admin: "Gestor" } as const;

// Conta do gestor: quem está logado e a saída.
const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const { clearSession } = useAuthStore();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Trigger type="button" aria-label={`Conta de ${user.name}`}>
          {getInitial(user.name)}
        </Trigger>
      </DropdownMenu.Trigger>
      <Content align="end" sideOffset={8}>
        <Identity>
          <Name>{user.name}</Name>
          <Email>{user.email}</Email>
          <Badge tone="neutral">{roleLabels[user.role]}</Badge>
        </Identity>
        <DropdownMenu.Separator />
        <DropdownMenu.Item color="red" onSelect={clearSession}>
          <ExitIcon aria-hidden="true" />
          Sair
        </DropdownMenu.Item>
      </Content>
    </DropdownMenu.Root>
  );
};

export default UserMenu;
