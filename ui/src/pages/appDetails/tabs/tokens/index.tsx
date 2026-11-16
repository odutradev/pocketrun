import { LockOpen1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { AlertDialog, Heading, Table, Text } from "@radix-ui/themes";
import { useState } from "react";

import { deleteToken } from "@actions/apps";
import Button from "@components/button";
import Card from "@components/card";
import EmptyState from "@components/emptyState";
import useAction from "@hooks/useAction";

import useAppDetailsPage from "../../hook";
import { ActionCell, DialogActions, Header } from "./styles";
import { tokenColumns } from "./table";

const TokensTab: React.FC = () => {
  const { applicationId, application, handleRefresh, handleOpenTokenModal } = useAppDetailsPage();
  const [tokenToRevoke, setTokenToRevoke] = useState<string | null>(null);
  const tokens = application?.tokens ?? [];

  const { execute: revokeToken } = useAction({
    action: (tokenId: string) => deleteToken(applicationId, tokenId),
    toastMessages: { pending: "Revogando token...", success: "Token revogado!", error: "Falha ao revogar token" },
    callback: () => {
      setTokenToRevoke(null);
      handleRefresh();
    }
  });

  const handleConfirmRevoke = () => {
    if (!tokenToRevoke) return;
    revokeToken(tokenToRevoke);
  };

  return (
    <Card size="3">
      <Header>
        <div>
          <Heading size="4" weight="bold">
            Tokens de Acesso da Aplicação
          </Heading>
          <Text size="2" color="gray">
            Chaves secretas para autenticar requisições de clientes autorizados.
          </Text>
        </div>
        <Button variant="solid" color="mint" size="2" onClick={handleOpenTokenModal} leftIcon={<PlusIcon />}>
          Novo Token
        </Button>
      </Header>

      {tokens.length === 0 ? (
        <EmptyState icon={<LockOpen1Icon />} message="Nenhum token gerado para esta aplicação." />
      ) : (
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Nome</Table.ColumnHeaderCell>
              {tokenColumns.map((column) => (
                <Table.ColumnHeaderCell key={column.key}>{column.header}</Table.ColumnHeaderCell>
              ))}
              <Table.ColumnHeaderCell align="center">Ações</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {tokens.map((token) => (
              <Table.Row key={token.id}>
                <Table.RowHeaderCell>{token.name}</Table.RowHeaderCell>
                {tokenColumns.map((column) => (
                  <Table.Cell key={column.key}>{column.render(token)}</Table.Cell>
                ))}
                <Table.Cell>
                  <ActionCell>
                    <Button
                      variant="ghost"
                      color="red"
                      size="1"
                      onClick={() => setTokenToRevoke(token.id)}
                      leftIcon={<TrashIcon />}
                      aria-label={`Revogar token ${token.name}`}
                    >
                      Revogar
                    </Button>
                  </ActionCell>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}

      <AlertDialog.Root open={Boolean(tokenToRevoke)} onOpenChange={(isOpen) => !isOpen && setTokenToRevoke(null)}>
        <AlertDialog.Content maxWidth="450px">
          <AlertDialog.Title size="4" weight="bold">
            Confirmar Revogação de Token
          </AlertDialog.Title>
          <AlertDialog.Description size="2" color="gray">
            Tem certeza que deseja revogar este token de acesso? Todas as requisições autenticadas por ele serão
            rejeitadas imediatamente.
          </AlertDialog.Description>
          <DialogActions>
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray" size="2">
                Cancelar
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button variant="solid" color="red" size="2" onClick={handleConfirmRevoke}>
                Sim, Revogar Token
              </Button>
            </AlertDialog.Action>
          </DialogActions>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Card>
  );
};

export default TokensTab;
