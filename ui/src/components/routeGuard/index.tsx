import { Suspense } from "react";
import { Navigate } from "react-router-dom";

import Loader from "@components/loader";
import useAuthStore from "@stores/auth";
import useSystemStore from "@stores/system";

import type { RouteGuardProps } from "./types";

const RouteGuard = ({ metadata, children }: RouteGuardProps) => {
  const { token, user } = useAuthStore();
  const { apiStatus, isSetupRequired, hasPermissions } = useSystemStore();

  if (metadata.privateRoute && !token) return <Navigate to="/auth" replace />;
  if (metadata.publicOnly && token) return <Navigate to="/" replace />;
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
