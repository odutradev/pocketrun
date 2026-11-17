import { Outlet, useLocation, useMatches, useNavigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { useEffect, useMemo } from "react";

import { createLocalLogger } from "@utils/functions";
import { healthCheckInterval } from "@assets/config";
import { Content, Main, Shell } from "./styles";
import { getSetupStatus } from "@actions/setup";
import { withContext } from "@styles/theme";
import ContextStyles from "@styles/context";
import useSystemStore from "@stores/system";
import Sidebar from "@components/sidebar";
import { ping } from "@actions/health";
import Alert from "@components/alert";

import type { RouteMatchHandle } from "./types";

const logger = createLocalLogger("appLayout");

const AppLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const matches = useMatches();
  const metadata = (matches.at(-1)?.handle as RouteMatchHandle | undefined)?.metadata;
  const context = metadata?.context ?? "general";
  const { apiStatus, setApiStatus, setSetupRequired } = useSystemStore();
  const contextTheme = useMemo(() => withContext(context), [context]);

  useEffect(() => {
    const controller = new AbortController();

    const verify = async () => {
      try {
        const [, status] = await Promise.all([ping(controller.signal), getSetupStatus(controller.signal)]);
        setApiStatus("online");
        setSetupRequired(status.setupRequired);
        if (status.setupRequired && pathname !== "/setup") navigate("/setup");
      } catch (error) {
        if (controller.signal.aborted) return;
        logger.warn(error);
        setApiStatus("offline");
      }
    };

    verify();
    const interval = window.setInterval(verify, healthCheckInterval);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [navigate, pathname, setApiStatus, setSetupRequired]);

  if (metadata?.layout === "bare") {
    return (
      <ThemeProvider theme={contextTheme}>
        <ContextStyles />
        <Outlet />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={contextTheme}>
      <ContextStyles />
      <Shell>
        <Sidebar />
        <Content>
          {apiStatus === "offline" && (
            <Alert tone="error" title="A API não responde." isBanner>
              Nova tentativa a cada {healthCheckInterval / 1000} segundos. Até lá, nada é salvo.
            </Alert>
          )}
          <Main>
            <Outlet />
          </Main>
        </Content>
      </Shell>
    </ThemeProvider>
  );
};

export default AppLayout;
