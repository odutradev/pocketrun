import { TrashIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import { ActionGroup, Actions, Form, Legend, Pair, Section, Swatch } from "./styles";
import { groupColorOptions, groupIconOptions } from "@assets/data";
import RemoveGroupDialog from "./subcomponents/removeGroupDialog";
import { createLinkGroup, updateLinkGroup } from "@actions/links";
import { linkGroupSchema } from "@utils/validations/link";
import { defaultGroupAppearance } from "@assets/config";
import OptionGrid from "./subcomponents/optionGrid";
import LinkButton from "@components/linkButton";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Input from "@components/input";
import useLinksPage from "../../hook";
import useForm from "@hooks/useForm";
import GroupTile from "../groupTile";

import type { LinkGroup, LinkGroupValues } from "@utils/types/link";

const GroupForm = () => {
  const { activeGroup, scopeTotal, handleGroupCreated, handleGroupSaved } = useLinksPage();
  const [isRemoving, setIsRemoving] = useState(false);

  const { execute } = useAction({
    action: (values: LinkGroupValues) => (activeGroup ? updateLinkGroup(activeGroup.id, values) : createLinkGroup(values)),
    toastMessages: {
      pending: activeGroup ? "Salvando o grupo…" : "Criando o grupo…",
      success: activeGroup ? "Grupo atualizado" : "Grupo criado",
      error: activeGroup ? "Não foi possível salvar o grupo" : "Não foi possível criar o grupo"
    },
    callback: (group: LinkGroup) => (activeGroup ? handleGroupSaved(group) : handleGroupCreated(group))
  });

  const { values, errors, isSubmitting, setFieldValue, handleChange, handleSubmit } = useForm({
    schema: linkGroupSchema,
    initialValues: {
      name: activeGroup?.name ?? "",
      color: activeGroup?.color ?? defaultGroupAppearance.color,
      icon: activeGroup?.icon ?? defaultGroupAppearance.icon
    },
    onSubmit: execute
  });

  const colorChoices = groupColorOptions.map((option) => ({ ...option, content: <Swatch $color={option.value} /> }));
  const iconChoices = groupIconOptions.map((option) => ({
    value: option.value,
    label: option.label,
    content: <GroupTile color={option.value === values.icon ? values.color : "gray"} icon={option.value} size="sm" />
  }));

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Section>
        <Legend>Grupo</Legend>
        <Pair>
          <Input
            label="Nome"
            name="name"
            autoComplete="off"
            placeholder="Campanhas"
            maxLength={60}
            value={values.name}
            onChange={handleChange}
            error={errors.name}
          />
          <OptionGrid
            label="Cor"
            name="color"
            options={colorChoices}
            value={values.color}
            onValueChange={(color) => setFieldValue("color", color)}
          />
        </Pair>
        <OptionGrid
          label="Ícone"
          name="icon"
          options={iconChoices}
          value={values.icon}
          onValueChange={(icon) => setFieldValue("icon", icon)}
        />
      </Section>
      <Actions>
        {activeGroup && (
          <Button type="button" variant="danger" leftIcon={<TrashIcon />} onClick={() => setIsRemoving(true)}>
            Excluir grupo
          </Button>
        )}
        <ActionGroup>
          <LinkButton to="/links">Cancelar</LinkButton>
          <Button type="submit" isLoading={isSubmitting} loadingLabel={activeGroup ? "Salvando…" : "Criando…"}>
            {activeGroup ? "Salvar alterações" : "Criar grupo"}
          </Button>
        </ActionGroup>
      </Actions>
      {activeGroup && (
        <RemoveGroupDialog
          group={activeGroup}
          linkCount={scopeTotal}
          isOpen={isRemoving}
          onClose={() => setIsRemoving(false)}
        />
      )}
    </Form>
  );
};

export default GroupForm;
