import { ExitIcon } from "@radix-ui/react-icons";

import { roleLabels } from "@assets/data";
import IconButton from "@components/iconButton";
import useAuthStore from "@stores/auth";
import { getInitial } from "@utils/functions";

import { Avatar, Container, Identity, Name, Profile, Role } from "./styles";
import type { ProfileLinkProps } from "./types";

const ProfileLink = ({ user, isActive }: ProfileLinkProps) => {
  const { clearSession } = useAuthStore();

  return (
    <Container>
      <Profile to="/profile" aria-current={isActive ? "page" : undefined} $isActive={isActive}>
        <Avatar aria-hidden="true">{getInitial(user.name)}</Avatar>
        <Identity>
          <Name>{user.name}</Name>
          <Role>{roleLabels[user.role]}</Role>
        </Identity>
      </Profile>
      <IconButton label="Sair" icon={<ExitIcon />} onClick={clearSession} />
    </Container>
  );
};

export default ProfileLink;
