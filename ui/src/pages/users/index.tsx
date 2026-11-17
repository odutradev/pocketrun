import { PlusIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";

import RemoveUserDialog from "./subcomponents/removeUserDialog";
import UserFormModal from "./subcomponents/userFormModal";
import ContentNavbar from "@components/contentNavbar";
import DataTable from "@components/dataTable";
import { getUserColumns } from "./table";
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
      <ContentNavbar
        title="Usuários"
        info="Quem entra no painel. Gestores cuidam dos serviços; superadmins também gerenciam os usuários."
        onReload={loadUsers}
        isReloading={isLoading || isRefreshing}
        action={{ label: "Novo usuário", icon: <PlusIcon />, onClick: handleOpenCreate }}
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
