import ApiStatus from "@components/apiStatus";
import BrandMark from "@components/brandMark";

import { Container, Content } from "./styles";
import SetupForm from "./subcomponents/setupForm";
import SetupSteps from "./subcomponents/setupSteps";

const SetupPage = () => (
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
