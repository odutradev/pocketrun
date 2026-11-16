import { ExitIcon, LockClosedIcon, MoonIcon, PersonIcon, StackIcon, SunIcon } from "@radix-ui/react-icons";
import { Badge, IconButton, Text } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";

import Button from "@components/button";
import useAuthStore from "@stores/auth";
import useSystemStore from "@stores/system";

import { Actions, Brand, BrandTitle, Header, Inner, LogoIcon, UserBadge } from "./styles";
import type { NavbarProps } from "./types";

const Navbar: React.FC<NavbarProps> = ({ apiStatus, setupRequired }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useSystemStore();
  const { user, clearSession } = useAuthStore();
  const themeLabel = theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro";

  return (
    <Header>
      <Inner>
        <Brand>
          <LogoIcon>
            <StackIcon />
          </LogoIcon>
          <BrandTitle size="3" weight="medium">
            PocketRun
          </BrandTitle>
          <Badge size="1" variant="surface" color="gray" radius="full">
            v2.0
          </Badge>
        </Brand>

        <Actions>
          <Badge size="1" variant="surface" color={apiStatus === "online" ? "grass" : "amber"} radius="full">
            <Text size="1" weight="medium">
              API {apiStatus}
            </Text>
          </Badge>

          {setupRequired && (
            <Badge size="1" variant="outline" color="amber" radius="full">
              Setup Inicial
            </Badge>
          )}

          <IconButton size="1" variant="soft" color="gray" onClick={toggleTheme} title={themeLabel} aria-label={themeLabel}>
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </IconButton>

          {user && (
            <>
              <UserBadge>
                <LockClosedIcon />
                <Text size="1" weight="medium">
                  {user.name}
                </Text>
                {user.role === "superadmin" && (
                  <Badge size="1" variant="solid" color="mint">
                    SUPERADMIN
                  </Badge>
                )}
              </UserBadge>
              <Button variant="ghost" color="gray" size="1" onClick={clearSession} leftIcon={<ExitIcon />}>
                Sair
              </Button>
            </>
          )}

          {!user && !setupRequired && (
            <Button variant="soft" color="mint" size="1" onClick={() => navigate("/auth")} leftIcon={<PersonIcon />}>
              Entrar como Gestor
            </Button>
          )}
        </Actions>
      </Inner>
    </Header>
  );
};

export default Navbar;
