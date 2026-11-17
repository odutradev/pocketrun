import ApiStatus from "@components/apiStatus";
import SegmentedControl from "@components/segmentedControl";

import useAuthPage from "../../hook";
import type { AuthMode } from "../../hook/types";
import LoginForm from "../loginForm";
import RegisterForm from "../registerForm";
import { Container, Eyebrow, Heading, Subtitle, Title } from "./styles";

const headings: Record<AuthMode, { title: string; subtitle: string }> = {
  login: {
    title: "Entrar no PocketRun",
    subtitle: "Use o e-mail e a senha de gestor desta instância."
  },
  register: {
    title: "Criar conta de gestor",
    subtitle: "Gestores criam aplicações e geram tokens de acesso."
  }
};

const modeOptions = [
  { value: "login" as const, label: "Entrar" },
  { value: "register" as const, label: "Criar conta" }
];

const AuthForm: React.FC = () => {
  const { mode, handleModeChange } = useAuthPage();

  return (
    <Container>
      <Heading>
        <Eyebrow>Acesso do gestor</Eyebrow>
        <Title>{headings[mode].title}</Title>
        <Subtitle>{headings[mode].subtitle}</Subtitle>
      </Heading>
      <SegmentedControl label="Tipo de acesso" options={modeOptions} value={mode} onValueChange={handleModeChange} isFullWidth />
      {mode === "login" ? <LoginForm /> : <RegisterForm />}
      <ApiStatus variant="panel" />
    </Container>
  );
};

export default AuthForm;
