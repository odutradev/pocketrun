import AppIcon from "./subcomponents/appIcon";
import BrandLogo from "./subcomponents/logo";
import BrandSymbol from "./subcomponents/symbol";
import type { BrandMarkProps } from "./types";

// Ponto único da identidade visual: símbolo, logos horizontal, empilhado e só texto, e ícone do app,
// em qualquer contexto, paleta e animação.
const BrandMark: React.FC<BrandMarkProps> = ({
  kind = "horizontal",
  size,
  context,
  palette,
  pose,
  motion,
  isStaggered,
  snapKey,
  status,
  ...symbolOnlyProps
}) => {
  const shared = { size, context, palette, pose, motion, isStaggered, snapKey, status };

  if (kind === "symbol") return <BrandSymbol {...shared} {...symbolOnlyProps} />;
  if (kind === "appIcon") return <AppIcon {...shared} />;
  return <BrandLogo {...shared} layout={kind} />;
};

export default BrandMark;
