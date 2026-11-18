import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useCallback, useState } from "react";

import { ActionGroup, Actions, Form, Legend, ModeHint, Pair, Section, TitleCount } from "./styles";
import { clickLimitRange, defaultPeriodHours, pageTitleMaxLength } from "@assets/config";
import { fromDateTimeInput, hoursFromNow, toDateTimeInput } from "@utils/functions";
import CreateGroupDialog from "./subcomponents/createGroupDialog";
import RemovePageDialog from "./subcomponents/removePageDialog";
import SegmentedControl from "@components/segmentedControl";
import { pageFormSchema } from "@utils/validations/sitePage";
import { createPage, updatePage } from "@actions/sitePages";
import PeriodPicker from "./subcomponents/periodPicker";
import SlugField from "./subcomponents/slugField";
import LinkButton from "@components/linkButton";
import RangeField from "@components/rangeField";
import { linkModeOptions, pageStarterHtml } from "@assets/data";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Select from "@components/select";
import Input from "@components/input";
import useForm from "@hooks/useForm";

import type { PageFormValues, LinkMode, PagePayload } from "@utils/types/sitePage";
import type { SlugCheck } from "./subcomponents/slugField/types";
import type { PageFormProps } from "./types";

const modeHints: Record<LinkMode, string> = {
  active: "A página fica no ar sempre, até você mudar o estado.",
  inactive: "A página sai do ar e responde 404. O slug continua reservado.",
  period: "A página fica no ar só dentro do período escolhido.",
  clicks: "A página fica no ar até atingir o limite de acessos, e depois responde 404."
};

const toPayload = (values: PageFormValues): PagePayload => ({
  title: values.title,
  slug: values.slug,
  groupId: values.groupId,
  mode: values.mode,
  startsAt: values.mode === "period" && values.startsAt ? fromDateTimeInput(values.startsAt) : null,
  endsAt: values.mode === "period" && values.endsAt ? fromDateTimeInput(values.endsAt) : null,
  maxClicks: values.mode === "clicks" ? Number.parseInt(values.maxClicks, 10) : null
});

const PageForm = ({ sitePage, groups, defaultGroupId, cancelTo, onGroupCreated, onSaved }: PageFormProps) => {
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [slugCheck, setSlugCheck] = useState<SlugCheck>({ status: "idle" });
  const handleSlugCheck = useCallback((check: SlugCheck) => setSlugCheck(check), []);

  const { execute } = useAction({
    action: (payload: PagePayload) => (sitePage ? updatePage(sitePage.id, payload) : createPage({ ...payload, html: pageStarterHtml })),
    toastMessages: {
      pending: sitePage ? "Salvando a página…" : "Criando a página…",
      success: sitePage ? "Página atualizada" : "Página criada",
      error: sitePage ? "Não foi possível salvar a página" : "Não foi possível criar a página"
    },
    callback: onSaved
  });

  const { values, errors, isSubmitting, setFieldValue, handleChange, handleSubmit } = useForm({
    schema: pageFormSchema,
    initialValues: {
      title: sitePage?.title ?? "",
      slug: sitePage?.slug ?? "",
      groupId: sitePage?.groupId ?? defaultGroupId,
      mode: sitePage?.mode ?? "active",
      startsAt: sitePage?.startsAt ? toDateTimeInput(sitePage.startsAt) : "",
      endsAt: sitePage?.endsAt ? toDateTimeInput(sitePage.endsAt) : "",
      maxClicks: String(sitePage?.maxClicks ?? clickLimitRange.initial)
    },
    onSubmit: (formValues: PageFormValues) => execute(toPayload(formValues))
  });

  const groupOptions = [{ value: "", label: "Sem grupo" }, ...groups.map((group) => ({ value: group.id, label: group.name }))];
  const isSlugBlocked = slugCheck.status === "checking" || slugCheck.status === "unavailable";

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Section>
        <Legend>Página</Legend>
        <Pair>
          <Input
            label="Título"
            name="title"
            autoComplete="off"
            placeholder="Convite de aniversário"
            maxLength={pageTitleMaxLength}
            hint="Só aparece no painel, para você achar a página."
            trailing={
              <TitleCount aria-hidden="true">
                {values.title.length}/{pageTitleMaxLength}
              </TitleCount>
            }
            value={values.title}
            onChange={handleChange}
            error={errors.title}
          />
          <Select
            label="Grupo *"
            options={groupOptions}
            value={values.groupId}
            onValueChange={(groupId) => setFieldValue("groupId", groupId)}
            action={{ label: "Novo grupo", icon: <PlusIcon />, onSelect: () => setIsCreatingGroup(true) }}
          />
        </Pair>
        <SlugField
          value={values.slug}
          pageId={sitePage?.id}
          error={errors.slug}
          onChange={(slug) => setFieldValue("slug", slug)}
          onCheckChange={handleSlugCheck}
        />
      </Section>
      <Section>
        <Legend>Ativação</Legend>
        <SegmentedControl
          label="Estado da página"
          options={linkModeOptions}
          value={values.mode}
          onValueChange={(mode) => {
            setFieldValue("mode", mode);
            if (mode === "period" && !values.endsAt) {
              setFieldValue("endsAt", hoursFromNow(defaultPeriodHours));
            }
          }}
          isFullWidth
          mobileColumns={2}
        />
        <ModeHint>{modeHints[values.mode]}</ModeHint>
        {values.mode === "period" && (
          <PeriodPicker
            startsAt={values.startsAt}
            endsAt={values.endsAt}
            initialPreset={sitePage?.mode === "period" ? "custom" : "7d"}
            startsAtError={errors.startsAt}
            endsAtError={errors.endsAt}
            onChange={({ startsAt, endsAt }) => {
              setFieldValue("startsAt", startsAt);
              setFieldValue("endsAt", endsAt);
            }}
          />
        )}
        {values.mode === "clicks" && (
          <RangeField
            label="Limite de acessos"
            min={clickLimitRange.min}
            max={clickLimitRange.max}
            unit="acessos"
            value={values.maxClicks === "" ? Number.NaN : Number(values.maxClicks)}
            onValueChange={(maxClicks) => setFieldValue("maxClicks", Number.isNaN(maxClicks) ? "" : String(maxClicks))}
            error={errors.maxClicks}
          />
        )}
      </Section>
      <Actions>
        {sitePage && (
          <Button type="button" variant="danger" leftIcon={<TrashIcon />} onClick={() => setIsRemoving(true)}>
            Excluir página
          </Button>
        )}
        <ActionGroup>
          <LinkButton to={cancelTo}>Cancelar</LinkButton>
          <Button
            type="submit"
            disabled={isSlugBlocked}
            isLoading={isSubmitting}
            loadingLabel={sitePage ? "Salvando…" : "Criando…"}
          >
            {sitePage ? "Salvar alterações" : "Criar página"}
          </Button>
        </ActionGroup>
      </Actions>
      {sitePage && <RemovePageDialog sitePage={sitePage} isOpen={isRemoving} onClose={() => setIsRemoving(false)} />}
      <CreateGroupDialog
        isOpen={isCreatingGroup}
        onClose={() => setIsCreatingGroup(false)}
        onCreated={(group) => {
          onGroupCreated(group);
          setFieldValue("groupId", group.id);
        }}
      />
    </Form>
  );
};

export default PageForm;
