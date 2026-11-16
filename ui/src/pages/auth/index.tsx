import AuthPanel from "@components/authPanel";
import Card from "@components/card";

import useAuthPage from "./hook";
import { Container } from "./styles";

const AuthPage: React.FC = () => {
  const { handleSuccess } = useAuthPage();

  return (
    <Container>
      <Card size="3">
        <AuthPanel onSuccess={handleSuccess} />
      </Card>
    </Container>
  );
};

export default AuthPage;
