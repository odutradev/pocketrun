import { PlusIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";

import { fromDateTimeInput, hoursFromNow, toDateTimeInput } from "@utils/functions";
import { Actions, Form, Legend, ModeHint, Pair, Section, TitleCount } from "./styles";
import { clickLimitRange, defaultPeriodHours, linkTitleMaxLength } from "@assets/config";
import CreateGroupDialog from "./subcomponents/createGroupDialog";
import DestinationField from "./subcomponents/destinationField";
import SegmentedControl from "@components/segmentedControl";
import { linkFormSchema } from "@utils/validations/link";
import { createLink, updateLink } from "@actions/links";
import PeriodPicker from "./subcomponents/periodPicker";
import SlugField from "./subcomponents/slugField";
import LinkButton from "@components/linkButton";
import RangeField from "@components/rangeField";
import { linkModeOptions } from "@assets/data";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Select from "@components/select";
import Input from "@components/input";
import useForm from "@hooks/useForm";

import type { LinkFormValues, LinkMode, LinkPayload } from "@utils/types/link";
import type { SlugCheck } from "./subcomponents/slugField/types";
import type { LinkFormProps } from "./types";

const modeHints: Record<LinkMode, string> = {
  active: "O link redireciona sempre, até você mudar o estado.",
  inactive: "O link para de redirecionar e responde 404. O slug continua reservado.",
  period: "O link redireciona só dentro do período escolhido.",
  clicks: "O link redireciona até atingir o limite de acessos, e depois responde 404."
};

const toPayload = (values: LinkFormValues): LinkPayload => ({
  title: values.title,
  slug: values.slug,
  url: values.url,
  groupId: values.groupId,
  mode: values.mode,
  startsAt: values.mode === "period" && values.startsAt ? fromDateTimeInput(values.startsAt) : null,
  endsAt: values.mode === "period" && values.endsAt ? fromDateTimeInput(values.endsAt) : null,
  maxClicks: values.mode === "clicks" ? Number.parseInt(values.maxClicks, 10) : null
});

const LinkForm = ({ link, groups, onGroupCreated }: LinkFormProps) => {
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const navigate = useNavigate();
  const [slugCheck, setSlugCheck] = useState<SlugCheck>({ status: "idle" });
  const handleSlugCheck = useCallback((check: SlugCheck) => setSlugCheck(check), []);

  const { execute } = useAction({
    action: (payload: LinkPayload) => (link ? updateLink(link.id, payload) : createLink(payload)),
    toastMessages: {
      pending: link ? "Salvando o link…" : "Criando o link…",
      success: link ? "Link atualizado" : "Link criado",
      error: link ? "Não foi possível salvar o link" : "Não foi possível criar o link"
    },
    callback: () => navigate("/links")
  });

  const { values, errors, isSubmitting, setFieldValue, handleChange, handleSubmit } = useForm({
    schema: linkFormSchema,
    initialValues: {
      title: link?.title ?? "",
      slug: link?.slug ?? "",
      url: link?.url ?? "",
      groupId: link?.groupId ?? "",
      mode: link?.mode ?? "active",
      startsAt: link?.startsAt ? toDateTimeInput(link.startsAt) : "",
      endsAt: link?.endsAt ? toDateTimeInput(link.endsAt) : "",
      maxClicks: String(link?.maxClicks ?? clickLimitRange.initial)
    },
    onSubmit: (formValues: LinkFormValues) => execute(toPayload(formValues))
  });

  const groupOptions = [{ value: "", label: "Sem grupo" }, ...groups.map((group) => ({ value: group.id, label: group.name }))];
  const isSlugBlocked = slugCheck.status === "checking" || slugCheck.status === "unavailable";

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Section>
        <Legend>Link</Legend>
        <Pair>
          <Input
            label="Título"
            name="title"
            autoComplete="off"
            placeholder="Promoção de dezembro"
            maxLength={linkTitleMaxLength}
            hint="Só aparece no painel, para você achar o link."
            trailing={
              <TitleCount aria-hidden="true">
                {values.title.length}/{linkTitleMaxLength}
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
        <Pair>
          <SlugField
            value={values.slug}
            linkId={link?.id}
            error={errors.slug}
            onChange={(slug) => setFieldValue("slug", slug)}
            onCheckChange={handleSlugCheck}
          />
          <DestinationField value={values.url} error={errors.url} onChange={(url) => setFieldValue("url", url)} />
        </Pair>
      </Section>
      <Section>
        <Legend>Ativação</Legend>
        <SegmentedControl
          label="Estado do link"
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
            initialPreset={link?.mode === "period" ? "custom" : "7d"}
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
        <LinkButton to="/links">Cancelar</LinkButton>
        <Button
          type="submit"
          disabled={isSlugBlocked}
          isLoading={isSubmitting}
          loadingLabel={link ? "Salvando…" : "Criando…"}
        >
          {link ? "Salvar alterações" : "Criar link"}
        </Button>
      </Actions>
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

export default LinkForm;
