import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

import { KeyHeader, KeyItem, KeyList, KeyMain, KeyMeta, KeyName, KeyPrefix, Strong } from "./styles";
import { currentTimestamp, formatDate, formatRelativeTime } from "@utils/functions";
import SectionHeader from "@components/sectionHeader";
import ConfirmDialog from "@components/confirmDialog";
import { apiKeyScopeLabels } from "@assets/data";
import IconButton from "@components/iconButton";
import EmptyState from "@components/emptyState";
import { deleteApiKey } from "@actions/auth";
import useAction from "@hooks/useAction";
import ApiKeyModal from "../apiKeyModal";
import useProfilePage from "../../hook";
import Button from "@components/button";
import Loader from "@components/loader";
import { Section } from "../../styles";
import Badge from "@components/badge";
import Card from "@components/card";

import type { AdminApiKey } from "@utils/types/apiKey";

const describeKey = (key: AdminApiKey, now: number): string =>
  [`Criada em ${formatDate(key.createdAt)}`, key.lastUsedAt ? `usada ${formatRelativeTime(key.lastUsedAt, now)}` : "nunca usada"].join(" · ");

const ApiKeysSection = () => {
  const { apiKeys: keys, isLoadingApiKeys: isLoading, loadApiKeys: loadKeys } = useProfilePage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<AdminApiKey | null>(null);
  const now = currentTimestamp();

  useEffect(() => {
    void loadKeys();
  }, [loadKeys]);

  const { execute: revokeKey, isPending } = useAction({
    action: (id: string) => deleteApiKey(id),
    toastMessages: { pending: "Revogando a chave…", success: "Chave revogada", error: "Não foi possível revogar a chave" },
    callback: () => {
      setKeyToRevoke(null);
      void loadKeys();
    }
  });

  return (
    <Card as="section" padding="lg" aria-labelledby="profile-api-keys">
      <Section>
        <SectionHeader
          titleId="profile-api-keys"
          title="Chaves de API para IA"
          description="Conecte o Claude ou outro cliente MCP para gerenciar páginas, links e o KV conversando. A IA age em seu nome, com a permissão da chave."
          actions={
            <Button size="sm" leftIcon={<PlusIcon />} onClick={() => setIsModalOpen(true)}>
              Nova chave
            </Button>
          }
        />
        {isLoading && <Loader label="Carregando as chaves" />}
        {!isLoading && keys.length === 0 && (
          <EmptyState
            isCompact
            title="Nenhuma chave ainda"
            description="Gere uma chave e cole a configuração no Claude. A documentação, na seção MCP para IA, explica cada passo."
          />
        )}
        {!isLoading && keys.length > 0 && (
          <KeyList>
            {keys.map((key) => (
              <KeyItem key={key.id}>
                <KeyMain>
                  <KeyHeader>
                    <KeyName title={key.name}>{key.name}</KeyName>
                    <Badge tone={key.scope === "full" ? "warning" : "neutral"}>{apiKeyScopeLabels[key.scope]}</Badge>
                  </KeyHeader>
                  <KeyPrefix>{key.prefix}</KeyPrefix>
                  <KeyMeta>{describeKey(key, now)}</KeyMeta>
                </KeyMain>
                <IconButton
                  variant="danger"
                  size="sm"
                  label={`Revogar a chave ${key.name}`}
                  icon={<TrashIcon />}
                  onClick={() => setKeyToRevoke(key)}
                />
              </KeyItem>
            ))}
          </KeyList>
        )}
      </Section>
      <ApiKeyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreated={() => void loadKeys()} />
      <ConfirmDialog
        isOpen={Boolean(keyToRevoke)}
        onClose={() => setKeyToRevoke(null)}
        onConfirm={() => keyToRevoke && revokeKey(keyToRevoke.id)}
        isPending={isPending}
        title="Revogar chave?"
        description={
          <>
            A IA que usa <Strong>{keyToRevoke?.name}</Strong> perde o acesso na hora. Não dá para desfazer.
          </>
        }
        confirmLabel="Revogar chave"
      />
    </Card>
  );
};

export default ApiKeysSection;
