import { CheckIcon, CopyIcon, EyeClosedIcon, EyeOpenIcon, Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { toast } from "react-toastify";

import { currentTimestamp, formatRelativeTime, getErrorMessage, kvRoleOptions } from "@utils/functions";
import { List, Row, RowActions, RowMain, RowMeta, RowName, RowPin, RowRole } from "./styles";
import { removePageAccessKey, revealPageAccessPin, setPageKv } from "@actions/sitePages";
import { Count, HeaderActions, Hint, Panel, PanelHeader, PanelTitle } from "../../styles";
import { pageAccessKeysMax, pageAccessPinLength } from "@assets/config";
import ConfirmDialog from "@components/confirmDialog";
import usePageEditorPage from "../../../../hook";
import IconButton from "@components/iconButton";
import useClipboard from "@hooks/useClipboard";
import { adminRoleName } from "@assets/data";
import useAction from "@hooks/useAction";
import KeyDialog from "../keyDialog";
import Button from "@components/button";
import Select from "@components/select";
import Alert from "@components/alert";

import type { PageAccessDialogState, PageAccessKey, PageKvPayload } from "@utils/types/sitePage";

const keyName = (key: PageAccessKey) => key.role || "PIN geral";
const hiddenPin = "•".repeat(pageAccessPinLength);
const unavailableLabel = "Troque este PIN para poder vê-lo de novo";
const noneValue = "__none";

const AccessList = () => {
  const { sitePage, access, kv, handleAccessChange, handleKvChange } = usePageEditorPage();
  const [dialog, setDialog] = useState<PageAccessDialogState | null>(null);
  const [removing, setRemoving] = useState<PageAccessKey | null>(null);
  const [pins, setPins] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const { copy, isCopied } = useClipboard();
  const pageId = sitePage?.id ?? "";
  const binding = kv?.binding ?? null;
  const application = kv?.application ?? null;
  const hasRoles = Boolean(binding && application);

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

  const remove = useAction({
    action: (keyId: string) => removePageAccessKey(pageId, keyId),
    toastMessages: { pending: "Apagando o PIN…", success: "PIN apagado", error: "Não foi possível apagar o PIN" },
    callback: (next) => {
      handleAccessChange(next);
      setRemoving(null);
    }
  });

  const saveRole = useAction({
    action: (payload: PageKvPayload) => setPageKv(pageId, payload),
    toastMessages: { pending: "Salvando o cargo…", success: "Cargo dos dados salvo", error: "Não foi possível salvar o cargo dos dados" },
    callback: handleKvChange
  });

  if (!access) return null;

  const keys = access.keys;
  const hasGeneral = keys.some((key) => key.role === "");
  const isFull = keys.length >= pageAccessKeysMax;
  const isLastProtected = access.isEnabled && keys.length === 1;
  const options = [{ value: noneValue, label: "Sem acesso aos dados" }, ...kvRoleOptions(application?.roles ?? [])];
  const mappedRole = (pageRole: string) => binding?.roles.find((mapping) => mapping.pageRole === pageRole)?.kvRole ?? "";
  const usesAdmin = [binding?.publicRole, ...(binding?.roles ?? []).map((mapping) => mapping.kvRole)].includes(adminRoleName);
  const now = currentTimestamp();

  const changeRole = (pageRole: string | null, value: string) => {
    if (!binding) return;
    const kvRole = value === noneValue ? "" : value;
    const roles = [{ role: "" }, ...keys.filter((key) => key.role !== "")].map(({ role }) => ({
      pageRole: role,
      kvRole: role === pageRole ? kvRole : mappedRole(role)
    }));
    saveRole.execute({ publicRole: pageRole === null ? kvRole : binding.publicRole, roles });
  };

  const roleSelect = (pageRole: string | null, label: string) =>
    hasRoles && (
      <RowRole>
        <Select
          label={`Cargo dos dados para ${label}`}
          isLabelHidden
          size="sm"
          options={options}
          value={(pageRole === null ? binding?.publicRole : mappedRole(pageRole)) || noneValue}
          onValueChange={(value) => changeRole(pageRole, value)}
          disabled={saveRole.isPending}
        />
      </RowRole>
    );

  return (
    <Panel aria-labelledby="page-access-list-title">
      <PanelHeader>
        <PanelTitle id="page-access-list-title">
          Quem abre a página
          <Count title={`Cada página aceita até ${pageAccessKeysMax} PINs`}>
            {keys.length}/{pageAccessKeysMax}
          </Count>
        </PanelTitle>
        <HeaderActions>
          {!hasGeneral && (
            <Button size="sm" variant="secondary" disabled={isFull} onClick={() => setDialog({ mode: "general", key: null, pin: "" })}>
              PIN geral
            </Button>
          )}
          <Button size="sm" leftIcon={<PlusIcon />} disabled={isFull} onClick={() => setDialog({ mode: "role", key: null, pin: "" })}>
            PIN de cargo
          </Button>
        </HeaderActions>
      </PanelHeader>
      <Hint>
        {hasRoles
          ? "Cada forma de abrir a página tem um PIN e um cargo dos dados, que decide o que ela pode fazer em cada coleção."
          : "O PIN geral vale para todo mundo. Os PINs de cargo são um por pessoa ou equipe, para você saber quem entrou e trocar um sem afetar os outros."}
      </Hint>
      <List>
        <Row>
          <RowMain>
            <RowName>Sem PIN</RowName>
            <RowMeta>{access.isEnabled ? "Não abre: a proteção por PIN está ligada" : "Qualquer pessoa com o endereço"}</RowMeta>
          </RowMain>
          {roleSelect(null, "quem abre sem PIN")}
          <RowActions />
        </Row>
        {keys.map((key) => (
          <Row key={key.id}>
            <RowMain>
              <RowName title={keyName(key)}>{keyName(key)}</RowName>
              <RowPin aria-label={visible[key.id] ? `PIN ${pins[key.id]}` : "PIN oculto"}>{visible[key.id] ? pins[key.id] : hiddenPin}</RowPin>
              <RowMeta>
                {key.pinUpdatedAt === key.createdAt ? "Criado" : "PIN trocado"} {formatRelativeTime(key.pinUpdatedAt, now)}
              </RowMeta>
            </RowMain>
            {roleSelect(key.role, keyName(key))}
            <RowActions>
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
              <IconButton label={`Editar ${keyName(key)}`} icon={<Pencil1Icon />} size="sm" disabled={loadingKey === key.id} onClick={() => openEdit(key)} />
              <IconButton
                label={isLastProtected ? "Desligue a proteção para apagar o último PIN" : `Apagar ${keyName(key)}`}
                icon={<TrashIcon />}
                size="sm"
                variant="danger"
                disabled={isLastProtected}
                onClick={() => setRemoving(key)}
              />
            </RowActions>
          </Row>
        ))}
      </List>
      {usesAdmin && (
        <Alert tone="warning">
          O cargo admin lê, grava e apaga em todas as coleções. Pela página, prefira um cargo com só as coleções que ela precisa.
        </Alert>
      )}
      {dialog && <KeyDialog key={`${dialog.mode}-${dialog.key?.id ?? "new"}`} dialog={dialog} onClose={() => setDialog(null)} onPinChange={storePin} />}
      <ConfirmDialog
        isOpen={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && remove.execute(removing.id)}
        title={`Apagar ${removing ? keyName(removing) : ""}?`}
        description="O PIN para de funcionar na hora e quem entrou com ele perde o acesso."
        confirmLabel="Apagar PIN"
        isPending={remove.isPending}
      />
    </Panel>
  );
};

export default AccessList;
