import { useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";

import { fromDateTimeInput, randomSlug, toDateTimeInput } from "@utils/functions";
import { Actions, Form, Legend, ModeHint, Pair, Section } from "./styles";
import SegmentedControl from "@components/segmentedControl";
import { linkFormSchema } from "@utils/validations/link";
import { createLink, updateLink } from "@actions/links";
import { randomSlugLength } from "@assets/config";
import SlugField from "./subcomponents/slugField";
import LinkButton from "@components/linkButton";
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
  period: "O link redireciona só dentro do período. Sem início, vale a partir de agora.",
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

const LinkForm = ({ link, groups }: LinkFormProps) => {
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
      slug: link?.slug ?? randomSlug(randomSlugLength),
      url: link?.url ?? "",
      groupId: link?.groupId ?? "",
      mode: link?.mode ?? "active",
      startsAt: link?.startsAt ? toDateTimeInput(link.startsAt) : "",
      endsAt: link?.endsAt ? toDateTimeInput(link.endsAt) : "",
      maxClicks: link?.maxClicks ? String(link.maxClicks) : ""
    },
    onSubmit: (formValues: LinkFormValues) => execute(toPayload(formValues))
  });

  const groupOptions = [{ value: "", label: "Sem grupo" }, ...groups.map((group) => ({ value: group.id, label: group.name }))];
  const isSlugBlocked = slugCheck.status === "checking" || slugCheck.status === "unavailable";

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Section>
        <Legend>Link</Legend>
        <Input
          label="Título"
          name="title"
          autoComplete="off"
          placeholder="Promoção de dezembro"
          hint="Só aparece no painel, para você achar o link."
          value={values.title}
          onChange={handleChange}
          error={errors.title}
        />
        <SlugField
          value={values.slug}
          linkId={link?.id}
          error={errors.slug}
          onChange={(slug) => setFieldValue("slug", slug)}
          onCheckChange={handleSlugCheck}
        />
        <Input
          label="URL de destino"
          name="url"
          type="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="https://exemplo.com/promo"
          value={values.url}
          onChange={handleChange}
          error={errors.url}
        />
        <Select
          label="Grupo"
          options={groupOptions}
          value={values.groupId}
          hint="Crie e renomeie grupos pelo botão Grupos na lista de links."
          onValueChange={(groupId) => setFieldValue("groupId", groupId)}
        />
      </Section>
      <Section>
        <Legend>Ativação</Legend>
        <SegmentedControl
          label="Estado do link"
          options={linkModeOptions}
          value={values.mode}
          onValueChange={(mode) => setFieldValue("mode", mode)}
          isFullWidth
        />
        <ModeHint>{modeHints[values.mode]}</ModeHint>
        {values.mode === "period" && (
          <Pair>
            <Input
              label="Início (opcional)"
              name="startsAt"
              type="datetime-local"
              value={values.startsAt}
              onChange={handleChange}
              error={errors.startsAt}
            />
            <Input
              label="Fim"
              name="endsAt"
              type="datetime-local"
              value={values.endsAt}
              onChange={handleChange}
              error={errors.endsAt}
            />
          </Pair>
        )}
        {values.mode === "clicks" && (
          <Input
            label="Limite de acessos"
            name="maxClicks"
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="100"
            hint={link ? `Este link já teve ${link.clicks} ${link.clicks === 1 ? "acesso" : "acessos"}.` : undefined}
            value={values.maxClicks}
            onChange={handleChange}
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
    </Form>
  );
};

export default LinkForm;
