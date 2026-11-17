import {
  Cross2Icon,
  FileTextIcon,
  HamburgerMenuIcon,
  LayersIcon,
  Link2Icon,
  PersonIcon,
  StackIcon
} from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "styled-components";

import ApiStatus from "@components/apiStatus";
import Badge from "@components/badge";
import BrandMark from "@components/brandMark";
import IconButton from "@components/iconButton";
import useAuthStore from "@stores/auth";
import useSystemStore from "@stores/system";

import {
  Aside,
  Backdrop,
  Bottom,
  Brand,
  BrandEnd,
  CloseSlot,
  GroupLabel,
  ItemBadge,
  LogoLink,
  MobileBar,
  Nav,
  NavGroup,
  NavLink,
  Top
} from "./styles";
import ProfileLink from "./subcomponents/profileLink";
import type { SidebarGroup, SidebarItem } from "./types";

const groups: SidebarGroup[] = [
  {
    label: "Painel",
    items: [
      { label: "Aplicações", to: "/", icon: <LayersIcon />, matches: ["/", "/apps"], requiredPermissions: ["manage_apps"] },
      { label: "Usuários", to: "/users", icon: <PersonIcon />, matches: ["/users"], requiredPermissions: ["manage_users"] }
    ]
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
        requiredPermissions: ["manage_apps"],
        badge: "Em breve"
      },
      {
        label: "Links",
        to: "/links",
        icon: <Link2Icon />,
        matches: ["/links"],
        requiredPermissions: ["manage_apps"],
        badge: "Em breve"
      }
    ]
  }
];

const isItemActive = (item: SidebarItem, pathname: string) =>
  item.matches.some((match) => (match === "/" ? pathname === "/" : pathname.startsWith(match)));

// Menu lateral: logo com o estado da API e áreas do painel em cima, o perfil do gestor embaixo.
// No celular vira uma gaveta aberta pela barra do topo.
const Sidebar: React.FC = () => {
  const { pathname } = useLocation();
  const { context } = useTheme();
  const { user } = useAuthStore();
  const { isSetupRequired, hasPermissions } = useSystemStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
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
        <LogoLink to="/" aria-label="PocketRun, ir para as aplicações">
          <BrandMark kind="horizontal" size={14} context={context} hasContextTransition />
        </LogoLink>
        <IconButton
          label="Abrir o menu"
          icon={<HamburgerMenuIcon />}
          aria-expanded={isOpen}
          aria-controls="panel-sidebar"
          onClick={() => setIsOpen(true)}
        />
      </MobileBar>
      <Backdrop $isOpen={isOpen} aria-hidden="true" onClick={() => setIsOpen(false)} />
      {/* Qualquer link clicado dentro do menu fecha a gaveta no celular. */}
      <Aside
        id="panel-sidebar"
        $isOpen={isOpen}
        aria-label="Menu do painel"
        onClick={(event) => {
          if (event.target instanceof Element && event.target.closest("a")) setIsOpen(false);
        }}
      >
        <Top>
          <Brand>
            <LogoLink to="/" aria-label="PocketRun, ir para as aplicações">
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
                <IconButton label="Fechar o menu" icon={<Cross2Icon />} size="sm" onClick={() => setIsOpen(false)} />
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
