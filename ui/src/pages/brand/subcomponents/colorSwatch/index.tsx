import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";

import useBrandPage from "../../hook";
import { Body, Chip, Description, Hex, Meta, Name, Swatch, SwatchButton } from "./styles";
import type { ColorSwatchProps } from "./types";

const ColorSwatch = ({ color, size = "regular" }: ColorSwatchProps) => {
  const { handleCopyColor, isCopied } = useBrandPage();
  const copied = isCopied(color.hex);

  return (
    <SwatchButton type="button" onClick={() => handleCopyColor(color.hex)} aria-label={`Copiar ${color.name} ${color.hex}`}>
      <Swatch $color={color.hex} $size={size}>
        <Hex $color={color.hex}>{color.hex}</Hex>
        <Chip>
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copiado" : "Copiar"}
        </Chip>
      </Swatch>
      <Body>
        <Name>{color.name}</Name>
        <Meta>
          {color.role} · {color.token}
        </Meta>
        {size === "large" && <Description>{color.description}</Description>}
      </Body>
    </SwatchButton>
  );
};

export default ColorSwatch;
