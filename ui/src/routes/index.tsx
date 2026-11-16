import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

import AppLayout from "@components/appLayout";
import RouteGuard from "@components/routeGuard";
import appDetailsMetadata from "@pages/appDetails/metadata";
import authMetadata from "@pages/auth/metadata";
import homeMetadata from "@pages/home/metadata";
import setupMetadata from "@pages/setup/metadata";
import type { PageMetadata } from "@utils/types/page";

const HomePage = lazy(() => import("@pages/home"));
const AuthPage = lazy(() => import("@pages/auth"));
const SetupPage = lazy(() => import("@pages/setup"));
const AppDetailsPage = lazy(() => import("@pages/appDetails"));

const pageRoute = (path: string, Page: LazyExoticComponent<ComponentType>, metadata: PageMetadata) => ({
  path,
  handle: { metadata },
  element: (
    <RouteGuard metadata={metadata}>
      <Page />
    </RouteGuard>
  )
});

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      pageRoute("/", HomePage, homeMetadata),
      pageRoute("/auth", AuthPage, authMetadata),
      pageRoute("/setup", SetupPage, setupMetadata),
      pageRoute("/apps/:applicationId", AppDetailsPage, appDetailsMetadata),
      { path: "*", element: <Navigate to="/" replace /> }
    ]
  }
]);

const AppRouter: React.FC = () => <RouterProvider router={router} />;

export default AppRouter;
