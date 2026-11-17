import { ExitIcon } from "@radix-ui/react-icons";

import { roleLabels } from "@assets/data";
import Badge from "@components/badge";
import Button from "@components/button";
import PageHeader from "@components/pageHeader";
import { formatDate } from "@utils/functions";

import useProfilePage from "./hook";
import IdentitySection from "./sections/identity";
import PasswordSection from "./sections/password";
import { Container } from "./styles";

const ProfilePage: React.FC = () => {
  const { user, handleSignOut } = useProfilePage();

  if (!user) return null;

  return (
    <Container>
      <PageHeader
        eyebrow="Sua conta"
        title="Perfil"
        description={`Conta criada em ${formatDate(user.createdAt)}.`}
        actions={
          <Button variant="secondary" leftIcon={<ExitIcon />} onClick={handleSignOut}>
            Sair
          </Button>
        }
      >
        <Badge tone={user.role === "superadmin" ? "accent" : "neutral"}>{roleLabels[user.role]}</Badge>
      </PageHeader>
      <IdentitySection />
      <PasswordSection />
    </Container>
  );
};

export default ProfilePage;
