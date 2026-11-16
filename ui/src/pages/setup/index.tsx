import Card from "@components/card";

import { Container, Content } from "./styles";
import SetupForm from "./subcomponents/setupForm";
import SetupHeader from "./subcomponents/setupHeader";

const SetupPage: React.FC = () => (
  <Container>
    <Card>
      <Content>
        <SetupHeader />
        <SetupForm />
      </Content>
    </Card>
  </Container>
);

export default SetupPage;
