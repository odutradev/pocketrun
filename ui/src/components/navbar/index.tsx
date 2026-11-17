import { useLocation } from "react-router-dom";
import { useTheme } from "styled-components";

import ApiStatus from "@components/apiStatus";
import Badge from "@components/badge";
import BrandMark from "@components/brandMark";
import LinkButton from "@components/linkButton";
import useAuthStore from "@stores/auth";
import useSystemStore from "@stores/system";

import { End, Header, Inner, LogoLink, Nav, NavLink } from "./styles";
import UserMenu from "./subcomponents/userMenu";
import type { NavItem } from "./types";

const navItems: NavItem[] = [
  { label: "Aplicações", to: "/", matches: ["/", "/apps"] },
  { label: "Identidade visual", to: "/id", matches: ["/id"] }
];

const isItemActive = (item: NavItem, pathname: string) =>
  item.matches.some((match) => (match === "/" ? pathname === "/" : pathname.startsWith(match)));

// Barra superior: logo no contexto da tela, navegação principal, estado da API e conta.
const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  const { context } = useTheme();
  const { user } = useAuthStore();
  const { isSetupRequired } = useSystemStore();

  return (
    <Header>
      <Inner>
        <LogoLink to="/" aria-label="PocketRun, ir para as aplicações">
          <BrandMark kind="horizontal" size={16} context={context} />
        </LogoLink>
        {user && (
          <Nav aria-label="Navegação principal">
            {navItems.map((item) => {
              const isActive = isItemActive(item, pathname);
              return (
                <NavLink key={item.to} to={item.to} aria-current={isActive ? "page" : undefined} $isActive={isActive}>
                  {item.label}
                </NavLink>
              );
            })}
          </Nav>
        )}
        <End>
          {isSetupRequired && (
            <Badge tone="warning" hasDot>
              Configuração pendente
            </Badge>
          )}
          <ApiStatus />
          {user ? (
            <UserMenu user={user} />
          ) : (
            <LinkButton to="/auth" size="sm">
              Entrar
            </LinkButton>
          )}
        </End>
      </Inner>
    </Header>
  );
};

export default Navbar;
