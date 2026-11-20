import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";

import { Actions, Form, OperationChip, Operations, RuleCard, RuleFields, RuleHeader, RuleList, RuleTitle, RulesLegend } from "./styles";
import { roleFormSchema } from "@utils/validations/application";
import { createRole, updateRole } from "@actions/apps";
import SwitchField from "@components/switchField";
import { kvOperationOptions } from "@assets/data";
import IconButton from "@components/iconButton";
import useAppEditorPage from "../../hook";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Alert from "@components/alert";
import Input from "@components/input";
import useForm from "@hooks/useForm";

import type { KvOperation, KvRole, KvRoleRule, RoleFormValues } from "@utils/types/application";
import type { RoleFormProps } from "./types";

const emptyRule: KvRoleRule = { collection: "", operations: ["read"], maxDocuments: 0 };

const toFormValues = (role: KvRole | null): RoleFormValues => ({
  name: role?.name ?? "",
  description: role?.description ?? "",
  isOwnDocumentsOnly: role?.isOwnDocumentsOnly ?? false,
  rules: role?.rules.map((rule) => ({ ...rule, operations: [...rule.operations] })) ?? [emptyRule]
});

const RoleForm = ({ role }: RoleFormProps) => {
  const { applicationId, handleCloseRoleModal, handleRefresh } = useAppEditorPage();

  const { execute } = useAction({
    action: ({ name, description, rules, isOwnDocumentsOnly }: RoleFormValues) =>
      role ? updateRole(applicationId, role.name, { description, rules, isOwnDocumentsOnly }) : createRole(applicationId, { name, description, rules, isOwnDocumentsOnly }),
    toastMessages: {
      pending: role ? "Salvando o cargo…" : "Criando o cargo…",
      success: role ? "Cargo atualizado" : "Cargo criado",
      error: role ? "Não foi possível salvar o cargo" : "Não foi possível criar o cargo"
    },
    callback: () => {
      handleCloseRoleModal();
      handleRefresh();
    }
  });

  const { values, errors, isSubmitting, setFieldValue, handleChange, handleSubmit } = useForm({
    schema: roleFormSchema,
    initialValues: toFormValues(role),
    onSubmit: execute
  });

  const updateRule = (index: number, changes: Partial<KvRoleRule>) =>
    setFieldValue(
      "rules",
      values.rules.map((rule, position) => (position === index ? { ...rule, ...changes } : rule))
    );

  const toggleOperation = (index: number, operation: KvOperation) => {
    const current = values.rules[index]?.operations ?? [];
    updateRule(index, { operations: current.includes(operation) ? current.filter((item) => item !== operation) : [...current, operation] });
  };

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Input
        label="Nome do cargo"
        name="name"
        placeholder="caixa"
        isMono
        hint={role ? "O nome não muda depois de criado: tokens e páginas apontam para ele." : "Letras minúsculas, números e hífen."}
        value={values.name}
        onChange={handleChange}
        error={errors.name}
        disabled={Boolean(role)}
      />
      <Input
        label="Descrição"
        name="description"
        placeholder="Registra vendas e consulta produtos"
        value={values.description}
        onChange={handleChange}
        error={errors.description}
      />
      <SwitchField
        label="Só os próprios documentos"
        description="O cargo lista, lê, edita e apaga só o que ele mesmo criou. Útil para formulários públicos e cadastros por pessoa."
        isChecked={values.isOwnDocumentsOnly}
        onCheckedChange={(isChecked) => setFieldValue("isOwnDocumentsOnly", isChecked)}
      />
      <RulesLegend>Regras por coleção</RulesLegend>
      <RuleList>
        {values.rules.map((rule, index) => (
          <RuleCard key={index}>
            <RuleHeader>
              <RuleTitle>Regra {index + 1}</RuleTitle>
              <IconButton
                size="sm"
                variant="danger"
                label={`Remover a regra ${index + 1}`}
                icon={<TrashIcon />}
                disabled={values.rules.length === 1}
                onClick={() => setFieldValue("rules", values.rules.filter((_, position) => position !== index))}
              />
            </RuleHeader>
            <RuleFields>
              <Input
                label="Coleção"
                placeholder="pedidos ou *"
                isMono
                value={rule.collection}
                onChange={(event) => updateRule(index, { collection: event.target.value })}
              />
              <Input
                label="Limite de documentos"
                type="number"
                min={0}
                inputMode="numeric"
                hint="0 é sem limite."
                value={String(rule.maxDocuments)}
                onChange={(event) => updateRule(index, { maxDocuments: Number(event.target.value || 0) })}
              />
            </RuleFields>
            <Operations role="group" aria-label={`Operações da regra ${index + 1}`}>
              {kvOperationOptions.map((option) => (
                <OperationChip
                  key={option.value}
                  type="button"
                  aria-pressed={rule.operations.includes(option.value)}
                  $isActive={rule.operations.includes(option.value)}
                  onClick={() => toggleOperation(index, option.value)}
                >
                  {option.label}
                </OperationChip>
              ))}
            </Operations>
          </RuleCard>
        ))}
      </RuleList>
      {errors.rules && <Alert tone="error">{errors.rules}</Alert>}
      <Button variant="secondary" size="sm" leftIcon={<PlusIcon />} onClick={() => setFieldValue("rules", [...values.rules, emptyRule])} disabled={values.rules.length >= 30}>
        Adicionar regra
      </Button>
      <Actions>
        <Button variant="secondary" onClick={handleCloseRoleModal}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting} loadingLabel="Salvando…">
          {role ? "Salvar cargo" : "Criar cargo"}
        </Button>
      </Actions>
    </Form>
  );
};

export default RoleForm;
