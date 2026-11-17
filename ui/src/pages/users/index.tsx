import { PlusIcon, ReloadIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";

import RemoveUserDialog from "./subcomponents/removeUserDialog";
import UserFormModal from "./subcomponents/userFormModal";
import IconButton from "@components/iconButton";
import PageHeader from "@components/pageHeader";
import DataTable from "@components/dataTable";
import { getUserColumns } from "./table";
import Button from "@components/button";
import UsersSkeleton from "./skeleton";
import { Container } from "./styles";
import useUsersPage from "./hook";

const UsersPage = () => {
  const {
    users,
    isLoading,
    isRefreshing,
    currentUserId,
    formTarget,
    loadUsers,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenRemove
  } = useUsersPage();

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const columns = getUserColumns({ currentUserId, onEdit: handleOpenEdit, onRemove: handleOpenRemove });

  return (
    <Container>
      <PageHeader
        eyebrow="Painel do gestor"
        title="Usuários"
        description="Quem entra no painel. Gestores cuidam das próprias aplicações; superadmins também gerenciam os usuários."
        actions={
          <>
            <IconButton
              variant="secondary"
              label="Atualizar a lista"
              icon={<ReloadIcon />}
              disabled={isLoading || isRefreshing}
              onClick={loadUsers}
            />
            <Button leftIcon={<PlusIcon />} onClick={handleOpenCreate}>
              Novo usuário
            </Button>
          </>
        }
      />
      {isLoading ? (
        <UsersSkeleton />
      ) : (
        <DataTable
          caption="Usuários com acesso ao painel"
          columns={columns}
          rows={users}
          getRowKey={(user) => user.id}
          minWidth="640px"
        />
      )}
      {formTarget && (
        <UserFormModal key={formTarget.mode === "edit" ? formTarget.user.id : "create"} />
      )}
      <RemoveUserDialog />
    </Container>
  );
};

export default UsersPage;
