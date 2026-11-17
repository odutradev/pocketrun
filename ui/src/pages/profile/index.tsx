import { ExitIcon } from "@radix-ui/react-icons";

import IdentitySection from "./subcomponents/identity";
import PasswordSection from "./subcomponents/password";
import PageHeader from "@components/pageHeader";
import { formatDate } from "@utils/functions";
import { roleLabels } from "@assets/data";
import Button from "@components/button";
import Badge from "@components/badge";
import { Container } from "./styles";
import useProfilePage from "./hook";

const ProfilePage = () => {
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
