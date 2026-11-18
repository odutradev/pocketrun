import { Navigate } from "react-router-dom";
import { Suspense } from "react";

import useSystemStore from "@stores/system";
import Loader from "@components/loader";
import useAuthStore from "@stores/auth";

import type { RouteGuardProps } from "./types";

const RouteGuard = ({ metadata, children }: RouteGuardProps) => {
  const { user } = useAuthStore();
  const { apiStatus, isSetupRequired, hasPermissions } = useSystemStore();

  if (metadata.privateRoute && !user) return <Navigate to="/auth" replace />;
  if (metadata.publicOnly && user) return <Navigate to="/" replace />;
  if (metadata.setupOnly && isSetupRequired === false) return <Navigate to="/auth" replace />;
  if (metadata.setupOnly && isSetupRequired === null && apiStatus !== "offline") {
    return <Loader label="Verificando a instância" isCentered />;
  }
  if (metadata.requiredPermissions && !hasPermissions(user?.role, metadata.requiredPermissions)) {
    return <Navigate to="/" replace />;
  }

  return <Suspense fallback={<Loader label="Carregando a página" isCentered />}>{children}</Suspense>;
};

export default RouteGuard;
