import { Spinner } from "@radix-ui/themes";
import { Suspense } from "react";
import { Navigate } from "react-router-dom";

import useAuthStore from "@stores/auth";
import useSystemStore from "@stores/system";

import { Fallback } from "./styles";
import type { RouteGuardProps } from "./types";

const RouteGuard: React.FC<RouteGuardProps> = ({ metadata, children }) => {
  const { token, user } = useAuthStore();
  const { hasPermissions } = useSystemStore();

  if (metadata.privateRoute && !token) return <Navigate to="/auth" replace />;
  if (metadata.publicOnly && token) return <Navigate to="/" replace />;
  if (metadata.requiredPermissions && !hasPermissions(user?.role, metadata.requiredPermissions)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense
      fallback={
        <Fallback>
          <Spinner size="3" />
        </Fallback>
      }
    >
      {children}
    </Suspense>
  );
};

export default RouteGuard;
