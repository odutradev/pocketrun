import { linkGroupSchema } from "@utils/validations/link";
import { createLinkGroup } from "@actions/links";
import { Actions, Form } from "./styles";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Dialog from "@components/dialog";
import Input from "@components/input";
import useForm from "@hooks/useForm";

import type { LinkGroup, LinkGroupValues } from "@utils/types/link";
import type { CreateGroupDialogProps } from "./types";

const CreateGroupDialog = ({ isOpen, onClose, onCreated }: CreateGroupDialogProps) => {
  const { execute } = useAction({
    action: (values: LinkGroupValues) => createLinkGroup(values),
    toastMessages: { pending: "Criando o grupo…", success: "Grupo criado", error: "Não foi possível criar o grupo" },
    callback: (group: LinkGroup) => {
      onCreated(group);
      onClose();
    }
  });

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
    schema: linkGroupSchema,
    initialValues: { name: "" },
    onSubmit: execute
  });

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Links"
      title="Novo grupo"
      description="O grupo só organiza a lista de links. Depois de criado, ele já fica escolhido neste link."
    >
      <Form onSubmit={handleSubmit} noValidate>
        <Input
          label="Nome do grupo"
          name="name"
          autoComplete="off"
          placeholder="Campanhas"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />
        <Actions>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} loadingLabel="Criando…">
            Criar grupo
          </Button>
        </Actions>
      </Form>
    </Dialog>
  );
};

export default CreateGroupDialog;
