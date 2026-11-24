import SetupSteps from "./subcomponents/setupSteps";
import SetupForm from "./subcomponents/setupForm";
import TokenForm from "./subcomponents/tokenForm";
import { Container, Content } from "./styles";
import ApiStatus from "@components/apiStatus";
import BrandMark from "@components/brandMark";
import useSetupPage from "./hook";

const SetupPage = () => {
  const { step } = useSetupPage();

  return (
    <Container>
      <BrandMark kind="horizontal" size={18} motion="intro" />
      <SetupSteps />
      <Content>
        {step === "token" ? <TokenForm /> : <SetupForm />}
        <ApiStatus variant="panel" />
      </Content>
    </Container>
  );
};

export default SetupPage;
