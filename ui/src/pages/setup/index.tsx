import SetupSteps from "./subcomponents/setupSteps";
import SetupForm from "./subcomponents/setupForm";
import { Container, Content } from "./styles";
import ApiStatus from "@components/apiStatus";
import BrandMark from "@components/brandMark";

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
