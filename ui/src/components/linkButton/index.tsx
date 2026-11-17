import { Anchor, RouterLink } from "./styles";
import type { LinkButtonProps } from "./types";

// Link com a aparência de botão: para navegar, não para executar ações.
const LinkButton: React.FC<LinkButtonProps> = ({
  children,
  to,
  href,
  variant = "secondary",
  size = "md",
  leftIcon,
  rightIcon,
  isFullWidth = false,
  isExternal = false
}) => {
  const styleProps = { $variant: variant, $size: size, $isFullWidth: isFullWidth };
  const content = (
    <>
      {leftIcon}
      {children}
      {rightIcon}
    </>
  );

  if (to) {
    return (
      <RouterLink to={to} {...styleProps}>
        {content}
      </RouterLink>
    );
  }

  return (
    <Anchor
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      {...styleProps}
    >
      {content}
    </Anchor>
  );
};

export default LinkButton;
