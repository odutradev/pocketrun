import { TrashIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { Header, Row, RowDescription, RowText, RowTitle, Strong, Subtitle, Title } from "./styles";
import ConfirmDialog from "@components/confirmDialog";
import { deleteApplication } from "@actions/apps";
import useAppDetailsPage from "../../hook";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Card from "@components/card";

const DangerTab = () => {
  const navigate = useNavigate();
  const { applicationId, application } = useAppDetailsPage();
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const projectId = application?.projectId ?? "";

  const { execute, isPending } = useAction({
    action: () => deleteApplication(applicationId),
    toastMessages: {
      pending: "Excluindo a aplicação…",
      success: "Aplicação excluída",
      error: "Não foi possível excluir a aplicação"
    },
    callback: () => navigate("/")
  });

  return (
    <Card as="section" tone="danger" padding="none" aria-labelledby="danger-title">
      <Header>
        <Title id="danger-title">Zona de perigo</Title>
        <Subtitle>Ações sem volta. Cada uma pede confirmação com o Project ID.</Subtitle>
      </Header>
      <Row>
        <RowText>
          <RowTitle>Excluir aplicação</RowTitle>
          <RowDescription>Apaga dados, coleções, tokens e configurações. Tudo.</RowDescription>
        </RowText>
        <Button variant="danger" leftIcon={<TrashIcon />} onClick={() => setConfirmOpen(true)}>
          Excluir
        </Button>
      </Row>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => execute()}
        isPending={isPending}
        title="Excluir aplicação?"
        description={
          <>
            <Strong>{application?.name}</Strong> e tudo o que pertence a ela serão apagados de vez. Clientes que usam os
            tokens dela param de funcionar na hora.
          </>
        }
        confirmLabel="Excluir para sempre"
        confirmationText={projectId}
      />
    </Card>
  );
};

export default DangerTab;
