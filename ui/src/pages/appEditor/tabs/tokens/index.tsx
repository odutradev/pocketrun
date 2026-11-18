import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import { Strong, TokenHeader, TokenItem, TokenList, TokenMain, TokenMeta, TokenName, TokenPrefix } from "./styles";
import { Column, Hint, Panel, PanelCount, PanelHeader, PanelTitle, Rules, SplitLayout } from "../../styles";
import { currentTimestamp, formatDate, formatRelativeTime } from "@utils/functions";
import ConfirmDialog from "@components/confirmDialog";
import ExpiryBadge from "@components/expiryBadge";
import IconButton from "@components/iconButton";
import EmptyState from "@components/emptyState";
import { deleteToken } from "@actions/apps";
import useAppEditorPage from "../../hook";
import useAction from "@hooks/useAction";
import Button from "@components/button";

import type { ApiToken } from "@utils/types/application";

const describeToken = (token: ApiToken, now: number): string =>
  [
    `Criado em ${formatDate(token.createdAt)}`,
    token.expiresAt ? `expira em ${formatDate(token.expiresAt)}` : "sem validade",
    token.lastUsedAt ? `usado ${formatRelativeTime(token.lastUsedAt, now)}` : "nunca usado"
  ].join(" · ");

const TokensTab = () => {
  const { applicationId, application, handleRefresh, handleOpenTokenModal } = useAppEditorPage();
  const [tokenToRevoke, setTokenToRevoke] = useState<ApiToken | null>(null);
  const tokens = application?.tokens ?? [];
  const now = currentTimestamp();

  const { execute: revokeToken, isPending } = useAction({
    action: (tokenId: string) => deleteToken(applicationId, tokenId),
    toastMessages: { pending: "Revogando o token…", success: "Token revogado", error: "Não foi possível revogar o token" },
    callback: () => {
      setTokenToRevoke(null);
      handleRefresh();
    }
  });

  return (
    <SplitLayout>
      <Column>
        <Panel aria-labelledby="tokens-title">
          <PanelHeader>
            <PanelTitle id="tokens-title">
              Tokens de acesso
              <PanelCount>{tokens.length}</PanelCount>
            </PanelTitle>
            <Button size="sm" leftIcon={<PlusIcon />} onClick={handleOpenTokenModal}>
              Novo token
            </Button>
          </PanelHeader>
          {tokens.length === 0 ? (
            <EmptyState
              isCompact
              title="Nenhum token ainda"
              description="Sem token, nenhum cliente consegue chamar a API desta aplicação. Gere um para cada site, app ou script."
            />
          ) : (
            <TokenList>
              {tokens.map((token) => (
                <TokenItem key={token.id}>
                  <TokenMain>
                    <TokenHeader>
                      <TokenName title={token.name}>{token.name}</TokenName>
                      <ExpiryBadge expiresAt={token.expiresAt} noneLabel="Ativo" isStatus />
                    </TokenHeader>
                    <TokenPrefix>{token.tokenPrefix}</TokenPrefix>
                    <TokenMeta>{describeToken(token, now)}</TokenMeta>
                  </TokenMain>
                  <IconButton
                    variant="danger"
                    size="sm"
                    label={`Revogar o token ${token.name}`}
                    icon={<TrashIcon />}
                    onClick={() => setTokenToRevoke(token)}
                  />
                </TokenItem>
              ))}
            </TokenList>
          )}
        </Panel>
      </Column>
      <Column>
        <Panel>
          <PanelTitle>Como o token é protegido</PanelTitle>
          <Rules>
            <li>O token completo aparece uma vez só, quando é gerado. O servidor guarda apenas um hash, e a lista mostra só o prefixo.</li>
            <li>Quem tem o token lê, grava e apaga os dados desta aplicação. Um token num site ou app de navegador fica visível no código.</li>
            <li>Gere um token por cliente, com validade, para revogar um sem derrubar os outros.</li>
            <li>Revogar corta o acesso na hora. Não dá para desfazer: o cliente precisa de um token novo.</li>
          </Rules>
        </Panel>
        <Panel>
          <PanelTitle>Como enviar</PanelTitle>
          <Hint>
            Mande o token no header Authorization (Bearer), X-Pocket-Token ou controlAccess. A aba Snippets tem exemplos prontos para copiar.
          </Hint>
        </Panel>
      </Column>
      <ConfirmDialog
        isOpen={Boolean(tokenToRevoke)}
        onClose={() => setTokenToRevoke(null)}
        onConfirm={() => tokenToRevoke && revokeToken(tokenToRevoke.id)}
        isPending={isPending}
        title="Revogar token?"
        description={
          <>
            Chamadas com <Strong>{tokenToRevoke?.name}</Strong> passam a ser recusadas na hora. Não dá para desfazer.
          </>
        }
        confirmLabel="Revogar token"
      />
    </SplitLayout>
  );
};

export default TokensTab;
