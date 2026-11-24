import { ArrowRightIcon } from "@radix-ui/react-icons";

import { Actions, Description, Form, Heading, Title } from "../../styles";
import Button from "@components/button";
import Input from "@components/input";
import useSetupPage from "../../hook";

const TokenForm = () => {
  const { tokenForm } = useSetupPage();
  const { values, errors, isSubmitting, handleChange, handleSubmit } = tokenForm;

  return (
    <Form onSubmit={handleSubmit} noValidate aria-labelledby="setup-token-title">
      <Heading>
        <Title id="setup-token-title">Confirme que o servidor é seu</Title>
        <Description>
          Ao iniciar sem nenhum gestor, a API mostra nos logs um token de setup na linha “initial setup required”. Copie esse token para continuar.
        </Description>
      </Heading>
      <Input
        label="Token de setup"
        name="setupToken"
        placeholder="XXXX-XXXX"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        isMono
        hint="Errou 5 vezes? A API gera um token novo e mostra nos logs."
        value={values.setupToken}
        onChange={handleChange}
        error={errors.setupToken}
      />
      <Actions>
        <Button type="submit" isLoading={isSubmitting} loadingLabel="Conferindo…" rightIcon={<ArrowRightIcon />}>
          Continuar
        </Button>
      </Actions>
    </Form>
  );
};

export default TokenForm;
