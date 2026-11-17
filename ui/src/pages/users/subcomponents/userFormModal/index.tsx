import { createUser, updateUser } from "@actions/users";
import { roleOptions } from "@assets/data";
import Button from "@components/button";
import Dialog from "@components/dialog";
import Input from "@components/input";
import Select from "@components/select";
import useAction from "@hooks/useAction";
import useForm from "@hooks/useForm";
import useAuthStore from "@stores/auth";
import type { User, UserRole } from "@utils/types/user";
import { newUserFormSchema, userFormSchema } from "@utils/validations/user";
import type { UserFormValues } from "@utils/validations/user";

import useUsersPage from "../../hook";
import { Actions, Form } from "./styles";

// Cria um usuário novo ou edita um existente. A página monta este diálogo com uma `key`
// por alvo, então o formulário sempre começa com os valores certos.
const UserFormModal: React.FC = () => {
  const { formTarget, currentUserId, handleCloseForm, loadUsers } = useUsersPage();
  const { setUser } = useAuthStore();
  const editedUser = formTarget?.mode === "edit" ? formTarget.user : null;
  const isSelf = editedUser?.id === currentUserId;

  const { execute } = useAction({
    action: (values: UserFormValues) => (editedUser ? updateUser(editedUser.id, values) : createUser(values)),
    toastMessages: {
      pending: editedUser ? "Salvando o usuário…" : "Criando o usuário…",
      success: editedUser ? "Usuário atualizado" : "Usuário criado",
      error: editedUser ? "Não foi possível salvar o usuário" : "Não foi possível criar o usuário"
    },
    callback: (saved: User) => {
      if (saved.id === currentUserId) setUser(saved);
      loadUsers();
      handleCloseForm();
    }
  });

  const { values, errors, isSubmitting, setFieldValue, handleChange, handleSubmit } = useForm({
    schema: editedUser ? userFormSchema : newUserFormSchema,
    initialValues: {
      name: editedUser?.name ?? "",
      email: editedUser?.email ?? "",
      role: editedUser?.role ?? "admin",
      password: ""
    },
    onSubmit: execute
  });

  return (
    <Dialog
      isOpen={formTarget !== null}
      onClose={handleCloseForm}
      eyebrow={editedUser ? "Editar usuário" : "Novo usuário"}
      title={editedUser ? editedUser.name : "Criar usuário"}
      description={
        editedUser
          ? "Altere os dados de acesso. Deixe a senha em branco para manter a atual."
          : "O usuário entra no painel com este e-mail e a senha inicial. Ele pode trocar a senha no perfil."
      }
    >
      <Form onSubmit={handleSubmit} noValidate>
        <Input
          label="Nome"
          name="name"
          autoComplete="off"
          placeholder="Maria Souza"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />
        <Input
          label="E-mail"
          name="email"
          type="email"
          autoComplete="off"
          placeholder="maria@exemplo.com"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Select
          label="Cargo"
          name="role"
          options={roleOptions}
          value={values.role}
          disabled={isSelf}
          hint={isSelf ? "Você não pode mudar o próprio cargo." : undefined}
          onValueChange={(role) => setFieldValue("role", role as UserRole)}
          error={errors.role}
        />
        <Input
          label={editedUser ? "Nova senha (opcional)" : "Senha inicial"}
          name="password"
          type="password"
          autoComplete="new-password"
          hint="No mínimo 8 caracteres, com uma letra e um número ou símbolo."
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Actions>
          <Button variant="secondary" onClick={handleCloseForm}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} loadingLabel={editedUser ? "Salvando…" : "Criando…"}>
            {editedUser ? "Salvar alterações" : "Criar usuário"}
          </Button>
        </Actions>
      </Form>
    </Dialog>
  );
};

export default UserFormModal;
