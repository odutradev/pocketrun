import { SegmentedControl } from "@radix-ui/themes";
import { useState } from "react";

import { Container, Tabs } from "./styles";
import AuthHeader from "./subcomponents/authHeader";
import LoginForm from "./subcomponents/loginForm";
import RegisterForm from "./subcomponents/registerForm";
import type { AuthMode, AuthPanelProps } from "./types";

const headings: Record<AuthMode, { title: string; subtitle: string }> = {
  login: {
    title: "Entrar no PocketRun",
    subtitle: "Acesse o painel administrativo da sua plataforma de microsserviços"
  },
  register: {
    title: "Criar Nova Conta",
    subtitle: "Cadastre sua conta para gerenciar aplicações e chaves de acesso"
  }
};

const AuthPanel: React.FC<AuthPanelProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <Container>
      <AuthHeader title={headings[mode].title} subtitle={headings[mode].subtitle} />
      <Tabs>
        <SegmentedControl.Root value={mode} onValueChange={(value) => setMode(value as AuthMode)} size="2">
          <SegmentedControl.Item value="login">Entrar</SegmentedControl.Item>
          <SegmentedControl.Item value="register">Novo Cadastro</SegmentedControl.Item>
        </SegmentedControl.Root>
      </Tabs>
      {mode === "login" ? <LoginForm onSuccess={onSuccess} /> : <RegisterForm onSuccess={onSuccess} />}
    </Container>
  );
};

export default AuthPanel;
