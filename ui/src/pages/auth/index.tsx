import { FormSide, Layout } from "./styles";
import AuthForm from "./subcomponents/authForm";
import AuthHero from "./subcomponents/authHero";

const AuthPage = () => (
  <Layout>
    <AuthHero />
    <FormSide>
      <AuthForm />
    </FormSide>
  </Layout>
);

export default AuthPage;
