import { Select as RadixSelect } from "@radix-ui/themes";
import { useState } from "react";

import { ProtocolContent, ProtocolItem, ProtocolSlot, ProtocolTrigger } from "./styles";
import { urlProtocolOptions } from "@assets/data";
import Input from "@components/input";

import type { DestinationFieldProps } from "./types";
import type { UrlProtocol } from "@utils/types/link";

const protocolPattern = /^(https?):\/\//i;

const detectProtocol = (url: string): UrlProtocol => {
  if (!url) return "https";
  const match = url.match(protocolPattern);
  if (!match) return "manual";
  return match[1].toLowerCase() === "http" ? "http" : "https";
};

const DestinationField = ({ value, error, onChange }: DestinationFieldProps) => {
  const [protocol, setProtocol] = useState<UrlProtocol>(() => detectProtocol(value));
  const address = protocol === "manual" ? value : value.replace(protocolPattern, "");

  const compose = (nextProtocol: UrlProtocol, nextAddress: string) =>
    nextProtocol === "manual" || nextAddress === "" ? nextAddress : `${nextProtocol}://${nextAddress}`;

  const handleProtocolChange = (nextProtocol: UrlProtocol) => {
    setProtocol(nextProtocol);
    onChange(compose(nextProtocol, nextProtocol === "manual" ? value : value.replace(protocolPattern, "")));
  };

  const handleAddressChange = (typed: string) => {
    const match = typed.trim().match(protocolPattern);
    if (protocol !== "manual" && match) {
      const pastedProtocol = match[1].toLowerCase() === "http" ? "http" : "https";
      setProtocol(pastedProtocol);
      onChange(compose(pastedProtocol, typed.trim().replace(protocolPattern, "")));
      return;
    }
    onChange(compose(protocol, typed));
  };

  return (
    <Input
      label="URL de destino"
      name="url"
      autoComplete="off"
      spellCheck={false}
      inputMode="url"
      placeholder={protocol === "manual" ? "https://exemplo.com/promo" : "exemplo.com/promo"}
      hint={
        protocol === "manual"
          ? "Modo manual: escreva a URL completa, com o protocolo."
          : "Escolha o protocolo ao lado. Colar uma URL completa troca o protocolo sozinho."
      }
      value={address}
      onChange={(event) => handleAddressChange(event.target.value)}
      error={error}
      leading={
        <ProtocolSlot>
          <RadixSelect.Root value={protocol} onValueChange={(next) => handleProtocolChange(next as UrlProtocol)}>
            <ProtocolTrigger variant="ghost" aria-label="Protocolo da URL" />
            <ProtocolContent position="popper" sideOffset={6}>
              {urlProtocolOptions.map((option) => (
                <ProtocolItem key={option.value} value={option.value}>
                  {option.label}
                </ProtocolItem>
              ))}
            </ProtocolContent>
          </RadixSelect.Root>
        </ProtocolSlot>
      }
    />
  );
};

export default DestinationField;
