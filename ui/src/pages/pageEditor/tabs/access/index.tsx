import { CheckIcon, CopyIcon, EyeClosedIcon, EyeOpenIcon, Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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
  KeyPin,
  Panel,
  PanelHeader,
  PanelTitle,
  Rules
} from "./styles";
import {
  removePageAccessKey,
  revealPageAccessPin,
  revokePageAccessSessions,
  setPageAccessEnabled,
  setPageAccessSessionHours
} from "@actions/sitePages";
import { currentTimestamp, formatRelativeTime, formatSessionHours, getErrorMessage } from "@utils/functions";
import { pageAccessKeysMax, pageAccessPinLength, pageAccessSessionHoursOptions } from "@assets/config";
import ConfirmDialog from "@components/confirmDialog";
import SwitchField from "@components/switchField";
import IconButton from "@components/iconButton";
import EmptyState from "@components/emptyState";
import useClipboard from "@hooks/useClipboard";
import Skeleton from "@components/skeleton";
import usePageEditorPage from "../../hook";
import KeyDialog from "./subcomponents/keyDialog";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Select from "@components/select";

import type { PageAccessDialogState, PageAccessKey } from "@utils/types/sitePage";
import type { AccessConfirm } from "./types";

const keyName = (key: PageAccessKey) => key.role || "PIN geral";
const hiddenPin = "•".repeat(pageAccessPinLength);
const unavailableLabel = "Troque este PIN para poder vê-lo de novo";

const AccessTab = () => {
  const { sitePage, access, hasLoadedAccess, loadAccess, handleAccessChange } = usePageEditorPage();
  const [dialog, setDialog] = useState<PageAccessDialogState | null>(null);
  const [confirm, setConfirm] = useState<AccessConfirm | null>(null);
  const [pins, setPins] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const { copy, isCopied } = useClipboard();
  const pageId = sitePage?.id ?? "";

  const storePin = (keyId: string, pin: string) => setPins((current) => ({ ...current, [keyId]: pin }));

  const loadPin = async (key: PageAccessKey) => {
    const cached = pins[key.id];
    if (cached) return cached;
    setLoadingKey(key.id);
    try {
      const { pin } = await revealPageAccessPin(pageId, key.id);
      storePin(key.id, pin);
      return pin;
    } catch (error) {
      toast.error(getErrorMessage(error, "Não foi possível mostrar o PIN"));
      return null;
    } finally {
      setLoadingKey(null);
    }
  };

  const toggleVisible = async (key: PageAccessKey) => {
    if (visible[key.id]) {
      setVisible((current) => ({ ...current, [key.id]: false }));
      return;
    }
    if (await loadPin(key)) setVisible((current) => ({ ...current, [key.id]: true }));
  };

  const copyPin = async (key: PageAccessKey) => {
    const pin = await loadPin(key);
    if (pin) copy(pin, key.id);
  };

  const openEdit = async (key: PageAccessKey) => {
    const pin = key.isRevealable ? await loadPin(key) : "";
    if (pin !== null) setDialog({ mode: "edit", key, pin });
  };

  useEffect(() => {
    if (!hasLoadedAccess) loadAccess();
  }, [hasLoadedAccess, loadAccess]);

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
  const sessionOptions = [...new Set([...pageAccessSessionHoursOptions, access.sessionHours])]
    .sort((first, second) => first - second)
    .map((hours) => ({ value: String(hours), label: formatSessionHours(hours) }));

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
                <Button size="sm" variant="secondary" disabled={isFull} onClick={() => setDialog({ mode: "general", key: null, pin: "" })}>
                  PIN geral
                </Button>
              )}
              <Button size="sm" leftIcon={<PlusIcon />} disabled={isFull} onClick={() => setDialog({ mode: "role", key: null, pin: "" })}>
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
                    <KeyPin aria-label={visible[key.id] ? `PIN ${pins[key.id]}` : "PIN oculto"}>{visible[key.id] ? pins[key.id] : hiddenPin}</KeyPin>
                    <KeyMeta>
                      {key.pinUpdatedAt === key.createdAt ? "Criado" : "PIN trocado"} {formatRelativeTime(key.pinUpdatedAt, now)}
                    </KeyMeta>
                  </KeyMain>
                  <KeyActions>
                    <IconButton
                      label={key.isRevealable ? (visible[key.id] ? `Esconder o PIN de ${keyName(key)}` : `Ver o PIN de ${keyName(key)}`) : unavailableLabel}
                      icon={visible[key.id] ? <EyeClosedIcon /> : <EyeOpenIcon />}
                      size="sm"
                      disabled={!key.isRevealable || loadingKey === key.id}
                      onClick={() => toggleVisible(key)}
                    />
                    <IconButton
                      label={key.isRevealable ? (isCopied(key.id) ? "PIN copiado" : `Copiar o PIN de ${keyName(key)}`) : unavailableLabel}
                      icon={isCopied(key.id) ? <CheckIcon /> : <CopyIcon />}
                      size="sm"
                      disabled={!key.isRevealable || loadingKey === key.id}
                      onClick={() => copyPin(key)}
                    />
                    <IconButton
                      label={`Editar ${keyName(key)}`}
                      icon={<Pencil1Icon />}
                      size="sm"
                      disabled={loadingKey === key.id}
                      onClick={() => openEdit(key)}
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
          <Hint>Quem acerta o PIN fica com a página liberada naquele navegador pelo tempo abaixo. Trocar o PIN de um cargo encerra só os acessos dele.</Hint>
          <Select
            label="Duração do acesso"
            options={sessionOptions}
            value={String(access.sessionHours)}
            onValueChange={(value) => session.execute(Number(value))}
            disabled={session.isPending}
            hint="Diminuir a duração também encurta os acessos que já estão abertos."
          />
          <div>
            <Button size="sm" variant="secondary" disabled={access.keys.length === 0} onClick={() => setConfirm({ kind: "revoke" })}>
              Encerrar todos os acessos
            </Button>
          </div>
        </Panel>
        <Panel>
          <PanelTitle>Como o PIN é protegido</PanelTitle>
          <Rules>
            <li>O PIN fica guardado criptografado e só quem gerencia a página consegue ver ou copiar. Cada vez que alguém vê, fica no histórico.</li>
            <li>O HTML da página só sai do servidor depois do PIN certo.</li>
            <li>Depois de 5 PINs errados, quem errou espera 15 minutos. Com 50 erros na mesma hora, a tela de PIN fecha para todos por um tempo.</li>
            <li>Cada abertura com PIN entra no histórico com o cargo usado.</li>
            <li>6 números protegem bem conteúdo de equipe, mas não servem para dados sensíveis, como documentos pessoais.</li>
          </Rules>
        </Panel>
      </Column>
      {dialog && <KeyDialog key={`${dialog.mode}-${dialog.key?.id ?? "new"}`} dialog={dialog} onClose={() => setDialog(null)} onPinChange={storePin} />}
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
