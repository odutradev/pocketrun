import { useState } from "react";

import { revokePageAccessSessions, setPageAccessEnabled, setPageAccessSessionHours } from "@actions/sitePages";
import { pageAccessSessionHoursOptions } from "@assets/config";
import { Hint, Panel, PanelTitle } from "../../styles";
import ConfirmDialog from "@components/confirmDialog";
import { formatSessionHours } from "@utils/functions";
import SwitchField from "@components/switchField";
import usePageEditorPage from "../../../../hook";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Select from "@components/select";

const ProtectionPanel = () => {
  const { sitePage, access, handleAccessChange } = usePageEditorPage();
  const [isRevoking, setIsRevoking] = useState(false);
  const pageId = sitePage?.id ?? "";

  const toggle = useAction({
    action: (isEnabled: boolean) => setPageAccessEnabled(pageId, isEnabled),
    toastMessages: { pending: "Salvando a proteção…", success: "Proteção atualizada", error: "Não foi possível mudar a proteção" },
    callback: handleAccessChange
  });

  const session = useAction({
    action: (sessionHours: number) => setPageAccessSessionHours(pageId, sessionHours),
    toastMessages: { pending: "Salvando a duração…", success: "Duração atualizada", error: "Não foi possível mudar a duração" },
    callback: handleAccessChange
  });

  const revoke = useAction({
    action: () => revokePageAccessSessions(pageId),
    toastMessages: { pending: "Encerrando os acessos…", success: "Acessos encerrados", error: "Não foi possível encerrar os acessos" },
    callback: (next) => {
      handleAccessChange(next);
      setIsRevoking(false);
    }
  });

  if (!access) return null;

  const sessionOptions = [...new Set([...pageAccessSessionHoursOptions, access.sessionHours])]
    .sort((first, second) => first - second)
    .map((hours) => ({ value: String(hours), label: formatSessionHours(hours) }));

  return (
    <Panel aria-labelledby="page-protection-title">
      <PanelTitle id="page-protection-title">Proteção</PanelTitle>
      <SwitchField
        label="Pedir PIN para abrir a página"
        description={
          access.keys.length === 0
            ? "Crie um PIN geral ou um PIN de cargo para poder ligar a proteção."
            : "Quem abrir o endereço vê uma tela de PIN antes do conteúdo. Desligada, a página abre direto e os PINs continuam guardados."
        }
        isChecked={access.isEnabled}
        isDisabled={toggle.isPending || access.keys.length === 0}
        onCheckedChange={(isEnabled) => toggle.execute(isEnabled)}
      />
      <Select
        label="Duração do acesso"
        options={sessionOptions}
        value={String(access.sessionHours)}
        onValueChange={(value) => session.execute(Number(value))}
        disabled={session.isPending}
        hint="Quem acerta o PIN fica com a página liberada nesse navegador por esse tempo. Diminuir também encurta os acessos abertos."
      />
      <Hint>Trocar o PIN de um cargo encerra só os acessos dele.</Hint>
      <div>
        <Button size="sm" variant="secondary" disabled={access.keys.length === 0} onClick={() => setIsRevoking(true)}>
          Encerrar todos os acessos
        </Button>
      </div>
      <ConfirmDialog
        isOpen={isRevoking}
        onClose={() => setIsRevoking(false)}
        onConfirm={() => revoke.execute()}
        title="Encerrar todos os acessos?"
        description="Todo mundo que já abriu a página com PIN vai precisar digitar o PIN de novo."
        confirmLabel="Encerrar acessos"
        isPending={revoke.isPending}
      />
    </Panel>
  );
};

export default ProtectionPanel;
