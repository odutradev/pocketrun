import { linkGroupSchema } from "@utils/validations/link";
import { defaultGroupAppearance } from "@assets/config";
import { createPageGroup } from "@actions/sitePages";
import { Actions, Form } from "./styles";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Dialog from "@components/dialog";
import Input from "@components/input";
import useForm from "@hooks/useForm";

import type { PageGroup, LinkGroupValues } from "@utils/types/sitePage";
import type { CreateGroupDialogProps } from "./types";

const CreateGroupDialog = ({ isOpen, onClose, onCreated }: CreateGroupDialogProps) => {
  const { execute } = useAction({
    action: (values: LinkGroupValues) => createPageGroup(values),
    toastMessages: { pending: "Criando o grupo…", success: "Grupo criado", error: "Não foi possível criar o grupo" },
    callback: (group: PageGroup) => {
      onCreated(group);
      onClose();
    }
  });

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
    schema: linkGroupSchema,
    initialValues: { name: "", ...defaultGroupAppearance },
    onSubmit: execute
  });

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Páginas"
      title="Novo grupo"
      description="O grupo só organiza a lista de páginas. Depois de criado, ele já fica escolhido nesta página."
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
