import { ExclamationTriangleIcon, TrashIcon } from "@radix-ui/react-icons";
import { Code, Heading, Text } from "@radix-ui/themes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { deleteApplication } from "@actions/apps";
import Button from "@components/button";
import Card from "@components/card";
import Input from "@components/input";
import useAction from "@hooks/useAction";

import useAppDetailsPage from "../../hook";
import { BlockText, Confirmation, Header } from "./styles";

const DangerTab: React.FC = () => {
  const navigate = useNavigate();
  const { applicationId, application } = useAppDetailsPage();
  const [confirmation, setConfirmation] = useState("");
  const projectId = application?.projectId ?? "";
  const isConfirmed = confirmation === projectId;

  const { execute, isPending } = useAction({
    action: () => deleteApplication(applicationId),
    toastMessages: {
      pending: "Excluindo aplicação...",
      success: "Aplicação excluída.",
      error: "Falha ao excluir aplicação"
    },
    callback: () => navigate("/")
  });

  return (
    <Card size="3" tone="danger">
      <Header>
        <ExclamationTriangleIcon />
        <div>
          <Heading size="4" weight="bold" color="red">
            Excluir Aplicação Permanentemente
          </Heading>
          <Text size="2" color="gray">
            Esta ação é irreversível. Todos os dados, chaves e coleções vinculados a este projeto serão apagados.
          </Text>
        </div>
      </Header>

      <Confirmation>
        <BlockText size="2" mb="1">
          Para confirmar, digite o identificador do projeto: <Code size="2">{projectId}</Code>
        </BlockText>
        <Input
          placeholder={projectId}
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          aria-label="Identificador do projeto"
        />
      </Confirmation>

      <Button
        variant="solid"
        color="red"
        size="2"
        disabled={!isConfirmed}
        loading={isPending}
        onClick={() => execute()}
        leftIcon={<TrashIcon />}
      >
        Excluir Esta Aplicação
      </Button>
    </Card>
  );
};

export default DangerTab;
