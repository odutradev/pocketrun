import { PlusIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import { deleteToken } from "@actions/apps";
import Alert from "@components/alert";
import Button from "@components/button";
import Card from "@components/card";
import ConfirmDialog from "@components/confirmDialog";
import DataTable from "@components/dataTable";
import EmptyState from "@components/emptyState";
import SectionHeader from "@components/sectionHeader";
import useAction from "@hooks/useAction";
import type { ApiToken } from "@utils/types/application";

import useAppDetailsPage from "../../hook";
import { Body, Strong } from "./styles";
import { getTokenColumns } from "./table";

const TokensTab = () => {
  const { applicationId, application, handleRefresh, handleOpenTokenModal } = useAppDetailsPage();
  const [tokenToRevoke, setTokenToRevoke] = useState<ApiToken | null>(null);
  const tokens = application?.tokens ?? [];

  const { execute: revokeToken, isPending } = useAction({
    action: (tokenId: string) => deleteToken(applicationId, tokenId),
    toastMessages: { pending: "Revogando o token…", success: "Token revogado", error: "Não foi possível revogar o token" },
    callback: () => {
      setTokenToRevoke(null);
      handleRefresh();
    }
  });

  const handleConfirmRevoke = () => {
    if (!tokenToRevoke) return;
    revokeToken(tokenToRevoke.id);
  };

  const newTokenButton = (
    <Button leftIcon={<PlusIcon />} onClick={handleOpenTokenModal}>
      Novo token
    </Button>
  );

  return (
    <Card as="section" aria-labelledby="tokens-title">
      <Body>
        <SectionHeader
          titleId="tokens-title"
          title="Tokens de acesso"
          description="Chaves que autorizam clientes a chamar a API desta aplicação."
          actions={tokens.length > 0 ? newTokenButton : undefined}
        />

        {tokens.length === 0 ? (
          <EmptyState
            isCompact
            title="Nenhum token ainda"
            description="Sem token, nenhum cliente consegue chamar a API desta aplicação."
            actions={newTokenButton}
          />
        ) : (
          <>
            <DataTable
              caption="Tokens de acesso da aplicação"
              columns={getTokenColumns(setTokenToRevoke)}
              rows={tokens}
              getRowKey={(token) => token.id}
              minWidth="720px"
            />
            <Alert>O token completo só aparece quando é gerado. Aqui a lista mostra apenas o prefixo.</Alert>
          </>
        )}
      </Body>

      <ConfirmDialog
        isOpen={Boolean(tokenToRevoke)}
        onClose={() => setTokenToRevoke(null)}
        onConfirm={handleConfirmRevoke}
        isPending={isPending}
        title="Revogar token?"
        description={
          <>
            Chamadas com <Strong>{tokenToRevoke?.name}</Strong> passam a ser recusadas na hora. Não dá para desfazer.
          </>
        }
        confirmLabel="Revogar token"
      />
    </Card>
  );
};

export default TokensTab;
