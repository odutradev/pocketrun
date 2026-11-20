import { Cross2Icon, FileTextIcon, HamburgerMenuIcon, HomeIcon, Link2Icon, PersonIcon, StackIcon } from "@radix-ui/react-icons";
import { useLocation } from "react-router-dom";
import { useTheme } from "styled-components";
import { useEffect, useState } from "react";

import { Aside, Backdrop, Bottom, Brand, BrandEnd, CloseSlot, GroupLabel, ItemBadge, LogoLink, MobileBar, Nav, NavGroup, NavLink, Top } from "./styles";
import ProfileLink from "./subcomponents/profileLink";
import IconButton from "@components/iconButton";
import ApiStatus from "@components/apiStatus";
import BrandMark from "@components/brandMark";
import useSystemStore from "@stores/system";
import useAuthStore from "@stores/auth";
import Badge from "@components/badge";

import type { SidebarGroup, SidebarItem } from "./types";

const groups: SidebarGroup[] = [
  {
    label: "Início",
    items: [{ label: "Geral", to: "/", icon: <HomeIcon />, matches: ["/"], requiredPermissions: ["manage_apps"] }]
  },
  {
    label: "Serviços",
    items: [
      { label: "KV", to: "/kv", icon: <StackIcon />, matches: ["/kv"], requiredPermissions: ["manage_apps"] },
      {
        label: "Páginas",
        to: "/pages",
        icon: <FileTextIcon />,
        matches: ["/pages"],
        requiredPermissions: ["manage_apps"]
      },
      { label: "Links", to: "/links", icon: <Link2Icon />, matches: ["/links"], requiredPermissions: ["manage_apps"] }
    ]
  },
  {
    label: "Painel",
    items: [
      { label: "Usuários", to: "/users", icon: <PersonIcon />, matches: ["/users"], requiredPermissions: ["manage_users"] }
    ]
  }
];

const isItemActive = (item: SidebarItem, pathname: string) =>
  item.matches.some((match) => (match === "/" ? pathname === "/" : pathname.startsWith(match)));

const Sidebar = () => {
  const { pathname } = useLocation();
  const { context, motion } = useTheme();
  const { user } = useAuthStore();
  const { isSetupRequired, hasPermissions } = useSystemStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [barContext, setBarContext] = useState(context);

  if (!isOpen && !isClosing && barContext !== context) setBarContext(context);

  const handleClose = () => {
    setIsOpen(false);
    setIsClosing(true);
  };

  useEffect(() => {
    if (!isClosing) return undefined;
    const timeout = window.setTimeout(() => setIsClosing(false), motion.base);
    return () => window.clearTimeout(timeout);
  }, [isClosing, motion.base]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.requiredPermissions || hasPermissions(user?.role, item.requiredPermissions)
      )
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <MobileBar>
        <LogoLink to="/" aria-label="PocketRun, ir para o início">
          <BrandMark kind="horizontal" size={14} context={barContext} hasContextTransition />
        </LogoLink>
        <IconButton
          label="Abrir o menu"
          icon={<HamburgerMenuIcon />}
          aria-expanded={isOpen}
          aria-controls="panel-sidebar"
          onClick={() => setIsOpen(true)}
        />
      </MobileBar>
      <Backdrop $isOpen={isOpen} aria-hidden="true" onClick={handleClose} />
      <Aside
        id="panel-sidebar"
        $isOpen={isOpen}
        aria-label="Menu do painel"
        onClick={(event) => {
          if (isOpen && event.target instanceof Element && event.target.closest("a")) handleClose();
        }}
      >
        <Top>
          <Brand>
            <LogoLink to="/" aria-label="PocketRun, ir para o início">
              <BrandMark
                kind="horizontal"
                size={15}
                context={context}
                motion="intro"
                hasContextTransition
                isHoverable
              />
            </LogoLink>
            <BrandEnd>
              <ApiStatus variant="dot" />
              <CloseSlot>
                <IconButton label="Fechar o menu" icon={<Cross2Icon />} size="sm" onClick={handleClose} />
              </CloseSlot>
            </BrandEnd>
          </Brand>
          <Nav aria-label="Navegação principal">
            {visibleGroups.map((group) => (
              <NavGroup key={group.label}>
                <GroupLabel>{group.label}</GroupLabel>
                {group.items.map((item) => {
                  const isActive = isItemActive(item, pathname);
                  return (
                    <NavLink key={item.to} to={item.to} aria-current={isActive ? "page" : undefined} $isActive={isActive}>
                      <span aria-hidden="true">{item.icon}</span>
                      {item.label}
                      {item.badge && <ItemBadge>{item.badge}</ItemBadge>}
                    </NavLink>
                  );
                })}
              </NavGroup>
            ))}
          </Nav>
        </Top>
        <Bottom>
          {isSetupRequired && (
            <Badge tone="warning" hasDot>
              Configuração pendente
            </Badge>
          )}
          {user && <ProfileLink user={user} isActive={pathname.startsWith("/profile")} />}
        </Bottom>
      </Aside>
    </>
  );
};

export default Sidebar;
