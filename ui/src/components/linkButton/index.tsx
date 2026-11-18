import VisuallyHidden from "@components/visuallyHidden";
import { Anchor, RouterLink } from "./styles";

import type { LinkButtonProps } from "./types";

const LinkButton = ({
  children,
  to,
  href,
  variant = "secondary",
  size = "md",
  leftIcon,
  rightIcon,
  isFullWidth = false,
  isIconOnly = false,
  isExternal = false
}: LinkButtonProps) => {
  const styleProps = { $variant: variant, $size: size, $isFullWidth: isFullWidth, $isIconOnly: isIconOnly };
  const title = isIconOnly && typeof children === "string" ? children : undefined;
  const content = (
    <>
      {leftIcon}
      {isIconOnly ? <VisuallyHidden>{children}</VisuallyHidden> : children}
      {rightIcon}
    </>
  );

  if (to) {
    return (
      <RouterLink to={to} title={title} {...styleProps}>
        {content}
      </RouterLink>
    );
  }

  return (
    <Anchor
      href={href}
      title={title}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      {...styleProps}
    >
      {content}
    </Anchor>
  );
};

export default LinkButton;
