import { ExitIcon } from "@radix-ui/react-icons";

import { Avatar, Container, Identity, Name, Profile, Role } from "./styles";
import IconButton from "@components/iconButton";
import { getInitial } from "@utils/functions";
import { roleLabels } from "@assets/data";
import { signOut } from "@actions/auth";

import type { ProfileLinkProps } from "./types";

const ProfileLink = ({ user, isActive }: ProfileLinkProps) => {
  return (
    <Container>
      <Profile to="/profile" aria-current={isActive ? "page" : undefined} $isActive={isActive}>
        <Avatar aria-hidden="true">{getInitial(user.name)}</Avatar>
        <Identity>
          <Name>{user.name}</Name>
          <Role>{roleLabels[user.role]}</Role>
        </Identity>
      </Profile>
      <IconButton label="Sair" icon={<ExitIcon />} onClick={signOut} />
    </Container>
  );
};

export default ProfileLink;
