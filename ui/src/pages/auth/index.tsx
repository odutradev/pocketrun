import AuthForm from "./subcomponents/authForm";
import AuthHero from "./subcomponents/authHero";
import { FormSide, Layout } from "./styles";

const AuthPage = () => (
  <Layout>
    <AuthHero />
    <FormSide>
      <AuthForm />
    </FormSide>
  </Layout>
);

export default AuthPage;
