import { ExitIcon } from "@radix-ui/react-icons";

import IdentitySection from "./subcomponents/identity";
import PasswordSection from "./subcomponents/password";
import SessionsSection from "./subcomponents/sessions";
import ContentNavbar from "@components/contentNavbar";
import { formatDate } from "@utils/functions";
import { roleLabels } from "@assets/data";
import { Container } from "./styles";
import useProfilePage from "./hook";

const ProfilePage = () => {
  const { user, handleSignOut } = useProfilePage();

  if (!user) return null;

  return (
    <Container>
      <ContentNavbar
        title="Perfil"
        info={`${roleLabels[user.role]} · conta criada em ${formatDate(user.createdAt)}. Aqui você muda seu nome, e-mail e senha.`}
        action={{ label: "Sair", icon: <ExitIcon />, onClick: handleSignOut, variant: "secondary" }}
      />
      <IdentitySection />
      <PasswordSection />
      <SessionsSection />
    </Container>
  );
};

export default ProfilePage;
