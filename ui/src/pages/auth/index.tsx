import { FormSide, Layout } from "./styles";
import AuthForm from "./subcomponents/authForm";
import AuthHero from "./subcomponents/authHero";

// Tela dividida: a marca e a proposta à esquerda, o acesso do gestor à direita.
const AuthPage: React.FC = () => (
  <Layout>
    <AuthHero />
    <FormSide>
      <AuthForm />
    </FormSide>
  </Layout>
);

export default AuthPage;
