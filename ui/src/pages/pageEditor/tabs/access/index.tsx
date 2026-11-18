import { CounterClockwiseClockIcon, Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

import {
  Column,
  Container,
  Count,
  HeaderActions,
  Hint,
  KeyActions,
  KeyItem,
  KeyList,
  KeyMain,
  KeyMeta,
  KeyName,
  Panel,
  PanelHeader,
  PanelTitle,
  Rules
} from "./styles";
import { removePageAccessKey, revokePageAccessSessions, setPageAccessEnabled } from "@actions/sitePages";
import { pageAccessKeysMax, pageAccessSessionHours } from "@assets/config";
import { currentTimestamp, formatRelativeTime } from "@utils/functions";
import ConfirmDialog from "@components/confirmDialog";
import SwitchField from "@components/switchField";
import IconButton from "@components/iconButton";
import EmptyState from "@components/emptyState";
import Skeleton from "@components/skeleton";
import usePageEditorPage from "../../hook";
import KeyDialog from "./subcomponents/keyDialog";
import useAction from "@hooks/useAction";
import Button from "@components/button";

import type { PageAccessDialogState, PageAccessKey } from "@utils/types/sitePage";
import type { AccessConfirm } from "./types";

const keyName = (key: PageAccessKey) => key.role || "PIN geral";

const AccessTab = () => {
  const { sitePage, access, hasLoadedAccess, loadAccess, handleAccessChange } = usePageEditorPage();
  const [dialog, setDialog] = useState<PageAccessDialogState | null>(null);
  const [confirm, setConfirm] = useState<AccessConfirm | null>(null);
  const pageId = sitePage?.id ?? "";

  useEffect(() => {
    if (!hasLoadedAccess) loadAccess();
  }, [hasLoadedAccess, loadAccess]);

  const toggle = useAction({
    action: (isEnabled: boolean) => setPageAccessEnabled(pageId, isEnabled),
    toastMessages: { pending: "Salvando a proteção…", success: "Proteção atualizada", error: "Não foi possível mudar a proteção" },
    callback: handleAccessChange
  });

  const remove = useAction({
    action: (keyId: string) => removePageAccessKey(pageId, keyId),
    toastMessages: { pending: "Apagando o PIN…", success: "PIN apagado", error: "Não foi possível apagar o PIN" },
    callback: (next) => {
      handleAccessChange(next);
      setConfirm(null);
    }
  });

  const revoke = useAction({
    action: () => revokePageAccessSessions(pageId),
    toastMessages: { pending: "Encerrando os acessos…", success: "Acessos encerrados", error: "Não foi possível encerrar os acessos" },
    callback: (next) => {
      handleAccessChange(next);
      setConfirm(null);
    }
  });

  if (!sitePage || !hasLoadedAccess || !access) {
    return (
      <Container aria-busy="true">
        <Skeleton height="220px" radius="panel" />
        <Skeleton height="160px" radius="panel" />
      </Container>
    );
  }

  const now = currentTimestamp();
  const hasGeneral = access.keys.some((key) => key.role === "");
  const isFull = access.keys.length >= pageAccessKeysMax;
  const isLastProtected = access.isEnabled && access.keys.length === 1;

  const handleConfirm = () => {
    if (!confirm) return;
    if (confirm.kind === "remove") {
      remove.execute(confirm.key.id);
      return;
    }
    revoke.execute();
  };

  return (
    <Container>
      <Column>
        <Panel>
          <SwitchField
            label="Pedir PIN para abrir a página"
            description={
              access.keys.length === 0
                ? "Crie um PIN geral ou um cargo para poder ligar a proteção."
                : "Quem abrir o endereço vê uma tela de PIN antes do conteúdo. Desligada, a página abre direto e os PINs continuam guardados."
            }
            isChecked={access.isEnabled}
            isDisabled={toggle.isPending || access.keys.length === 0}
            onCheckedChange={(isEnabled) => toggle.execute(isEnabled)}
          />
        </Panel>
        <Panel>
          <PanelHeader>
            <PanelTitle>
              PINs
              <Count title={`Cada página aceita até ${pageAccessKeysMax} PINs`}>
                {access.keys.length}/{pageAccessKeysMax}
              </Count>
            </PanelTitle>
            <HeaderActions>
              {!hasGeneral && (
                <Button size="sm" variant="secondary" disabled={isFull} onClick={() => setDialog({ mode: "general", key: null })}>
                  PIN geral
                </Button>
              )}
              <Button size="sm" leftIcon={<PlusIcon />} disabled={isFull} onClick={() => setDialog({ mode: "role", key: null })}>
                Novo cargo
              </Button>
            </HeaderActions>
          </PanelHeader>
          {access.keys.length === 0 ? (
            <EmptyState
              isCompact
              title="Nenhum PIN ainda"
              description="O PIN geral vale para todo mundo. Os cargos têm um PIN cada, para você saber quem entrou e trocar o de um sem afetar os outros."
            />
          ) : (
            <KeyList>
              {access.keys.map((key) => (
                <KeyItem key={key.id}>
                  <KeyMain>
                    <KeyName title={keyName(key)}>{keyName(key)}</KeyName>
                    <KeyMeta>
                      {key.pinUpdatedAt === key.createdAt ? "Criado" : "PIN trocado"} {formatRelativeTime(key.pinUpdatedAt, now)}
                    </KeyMeta>
                  </KeyMain>
                  <KeyActions>
                    {key.role && (
                      <IconButton label={`Renomear o cargo ${key.role}`} icon={<Pencil1Icon />} size="sm" onClick={() => setDialog({ mode: "rename", key })} />
                    )}
                    <IconButton
                      label={`Trocar o PIN de ${keyName(key)}`}
                      icon={<CounterClockwiseClockIcon />}
                      size="sm"
                      onClick={() => setDialog({ mode: "reset", key })}
                    />
                    <IconButton
                      label={isLastProtected ? "Desligue a proteção para apagar o último PIN" : `Apagar ${keyName(key)}`}
                      icon={<TrashIcon />}
                      size="sm"
                      variant="danger"
                      disabled={isLastProtected}
                      onClick={() => setConfirm({ kind: "remove", key })}
                    />
                  </KeyActions>
                </KeyItem>
              ))}
            </KeyList>
          )}
        </Panel>
      </Column>
      <Column>
        <Panel>
          <PanelTitle>Acessos abertos</PanelTitle>
          <Hint>
            Quem acerta o PIN fica com a página liberada naquele navegador por {pageAccessSessionHours} horas. Trocar o PIN de um cargo encerra só os
            acessos dele.
          </Hint>
          <div>
            <Button size="sm" variant="secondary" disabled={access.keys.length === 0} onClick={() => setConfirm({ kind: "revoke" })}>
              Encerrar todos os acessos
            </Button>
          </div>
        </Panel>
        <Panel>
          <PanelTitle>Como o PIN é protegido</PanelTitle>
          <Rules>
            <li>O PIN aparece só na hora em que é criado ou trocado. Depois, nem o painel consegue mostrar de novo.</li>
            <li>O HTML da página só sai do servidor depois do PIN certo.</li>
            <li>Depois de 5 PINs errados, quem errou espera 15 minutos. Com 50 erros na mesma hora, a tela de PIN fecha para todos por um tempo.</li>
            <li>Cada abertura com PIN entra no histórico com o cargo usado.</li>
            <li>6 números protegem bem conteúdo de equipe, mas não servem para dados sensíveis, como documentos pessoais.</li>
          </Rules>
        </Panel>
      </Column>
      {dialog && <KeyDialog key={`${dialog.mode}-${dialog.key?.id ?? "new"}`} dialog={dialog} onClose={() => setDialog(null)} />}
      <ConfirmDialog
        isOpen={confirm !== null}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
        title={confirm?.kind === "revoke" ? "Encerrar todos os acessos?" : `Apagar ${confirm?.kind === "remove" ? keyName(confirm.key) : ""}?`}
        description={
          confirm?.kind === "revoke"
            ? "Todo mundo que já abriu a página com PIN vai precisar digitar o PIN de novo."
            : "O PIN para de funcionar na hora e quem entrou com ele perde o acesso."
        }
        confirmLabel={confirm?.kind === "revoke" ? "Encerrar acessos" : "Apagar PIN"}
        isPending={remove.isPending || revoke.isPending}
      />
    </Container>
  );
};

export default AccessTab;
