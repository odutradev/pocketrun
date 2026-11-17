import ApiStatus from "@components/apiStatus";
import BrandMark from "@components/brandMark";

import { Container, Content } from "./styles";
import SetupForm from "./subcomponents/setupForm";
import SetupSteps from "./subcomponents/setupSteps";

// Primeiro acesso da instância: aparece uma vez, até existir o primeiro gestor.
const SetupPage: React.FC = () => (
  <Container>
    <BrandMark kind="horizontal" size={18} motion="intro" />
    <SetupSteps />
    <Content>
      <SetupForm />
      <ApiStatus variant="panel" />
    </Content>
  </Container>
);

export default SetupPage;
