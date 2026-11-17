import ApiStatus from "@components/apiStatus";

import LoginForm from "../loginForm";
import { Container, Eyebrow, Heading, Subtitle, Title } from "./styles";

const AuthForm = () => (
  <Container>
    <Heading>
      <Eyebrow>Acesso do gestor</Eyebrow>
      <Title>Entrar no PocketRun</Title>
      <Subtitle>Use o e-mail e a senha de gestor desta instância.</Subtitle>
    </Heading>
    <LoginForm />
    <ApiStatus variant="panel" />
  </Container>
);

export default AuthForm;
