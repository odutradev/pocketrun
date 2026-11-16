import { useEffect, useState } from "react";
import { Outlet, useLocation, useMatches, useNavigate } from "react-router-dom";

import { ping } from "@actions/health";
import { getSetupStatus } from "@actions/setup";
import { healthCheckInterval } from "@assets/config";
import Navbar from "@components/navbar";
import type { ApiHealthStatus } from "@components/navbar/types";
import { createLocalLogger } from "@utils/functions";

import { Background, Main } from "./styles";
import type { RouteMatchHandle } from "./types";

const logger = createLocalLogger("appLayout");

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const matches = useMatches();
  const metadata = (matches.at(-1)?.handle as RouteMatchHandle | undefined)?.metadata;
  const [apiStatus, setApiStatus] = useState<ApiHealthStatus>("online");
  const [setupRequired, setSetupRequired] = useState(false);

  useEffect(() => {
    document.title = metadata ? `${metadata.title} | PocketRun` : "PocketRun";
  }, [metadata]);

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
  }, [navigate, pathname]);

  return (
    <Background>
      <Navbar apiStatus={apiStatus} setupRequired={setupRequired} />
      <Main $center={Boolean(metadata?.center)}>
        <Outlet />
      </Main>
    </Background>
  );
};

export default AppLayout;
