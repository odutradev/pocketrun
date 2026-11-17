import { CheckCircledIcon, CrossCircledIcon, ReloadIcon, ShuffleIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

import { publicLinkUrl, randomSlug, toSlug } from "@utils/functions";
import { randomSlugLength, slugCheckDelay } from "@assets/config";
import { DiceSlot, PublicUrl, Row, StatusIcon } from "./styles";
import { slugPattern } from "@utils/validations/link";
import { slugReasonMessages } from "@assets/data";
import IconButton from "@components/iconButton";
import { checkLinkSlug } from "@actions/links";
import Input from "@components/input";

import type { SlugCheck, SlugFieldProps } from "./types";

const statusLabels = {
  checking: "Verificando a disponibilidade",
  available: "Slug disponível",
  unavailable: "Slug indisponível",
  failed: "Não foi possível verificar o slug"
} as const;

const SlugField = ({ value, linkId, error, onChange, onCheckChange }: SlugFieldProps) => {
  const [check, setCheck] = useState<SlugCheck>({ status: "idle" });

  useEffect(() => {
    const controller = new AbortController();
    const update = (next: SlugCheck) => {
      setCheck(next);
      onCheckChange(next);
    };

    if (!slugPattern.test(value)) {
      update({ status: "idle" });
      return () => controller.abort();
    }

    update({ status: "checking" });
    const timeout = window.setTimeout(async () => {
      try {
        const availability = await checkLinkSlug(value, linkId, controller.signal);
        update(availability.isAvailable ? { status: "available" } : { status: "unavailable", reason: availability.reason });
      } catch {
        if (!controller.signal.aborted) update({ status: "failed" });
      }
    }, slugCheckDelay);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [value, linkId, onCheckChange]);

  const unavailableMessage = check.status === "unavailable" && check.reason ? slugReasonMessages[check.reason] : undefined;
  const statusIcon = {
    idle: null,
    checking: <ReloadIcon />,
    available: <CheckCircledIcon />,
    unavailable: <CrossCircledIcon />,
    failed: <CrossCircledIcon />
  }[check.status];

  return (
    <Row>
      <Input
        label="Slug"
        name="slug"
        autoComplete="off"
        spellCheck={false}
        isMono
        maxLength={64}
        placeholder="promocao-de-dezembro"
        value={value}
        onChange={(event) => onChange(toSlug(event.target.value))}
        error={error ?? unavailableMessage}
        hint={value ? <PublicUrl>{publicLinkUrl(value)}</PublicUrl> : undefined}
        trailing={
          statusIcon && (
            <StatusIcon $status={check.status} role="status" aria-label={statusLabels[check.status as keyof typeof statusLabels]}>
              {statusIcon}
            </StatusIcon>
          )
        }
      />
      <DiceSlot>
        <IconButton
          label="Gerar um id aleatório"
          variant="secondary"
          icon={<ShuffleIcon />}
          onClick={() => onChange(randomSlug(randomSlugLength))}
        />
      </DiceSlot>
    </Row>
  );
};

export default SlugField;
