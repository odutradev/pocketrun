import { useState } from "react";

import SectionHeader from "@components/sectionHeader";
import ConfirmDialog from "@components/confirmDialog";
import { Actions, Section } from "../../styles";
import { revokeSessions } from "@actions/auth";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Card from "@components/card";

const SessionsSection = () => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const revoke = useAction({
    action: revokeSessions,
    toastMessages: { pending: "Encerrando as sessões…", success: "Sessões encerradas", error: "Não foi possível encerrar as sessões" }
  });

  return (
    <Card as="section" padding="lg" aria-labelledby="profile-sessions">
      <Section>
        <SectionHeader
          titleId="profile-sessions"
          title="Sessões"
          description="Cada login vale 7 dias no navegador. Se perdeu um dispositivo ou entrou num computador de outra pessoa, encerre todas as sessões, inclusive esta."
        />
        <Actions>
          <Button variant="secondary" onClick={() => setIsConfirmOpen(true)}>
            Sair de todos os dispositivos
          </Button>
        </Actions>
      </Section>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => revoke.execute()}
        title="Sair de todos os dispositivos?"
        description="Todos os navegadores com o painel aberto, inclusive este, vão pedir login de novo."
        confirmLabel="Sair de todos"
        isPending={revoke.isPending}
      />
    </Card>
  );
};

export default SessionsSection;
