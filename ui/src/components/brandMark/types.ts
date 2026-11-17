import type { LogoKind } from "@utils/types/brand";

import type { BrandSymbolProps } from "./subcomponents/symbol/types";

export interface BrandMarkProps extends BrandSymbolProps {
  // Qual peça da marca desenhar. O `size` muda de sentido conforme a peça:
  // altura no símbolo, corpo da fonte nos logos e lado do bloco no ícone do app.
  kind?: LogoKind;
}
