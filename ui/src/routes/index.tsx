import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

import AppLayout from "@components/appLayout";
import RouteGuard from "@components/routeGuard";
import appDetailsMetadata from "@pages/appDetails/metadata";
import authMetadata from "@pages/auth/metadata";
import brandMetadata from "@pages/brand/metadata";
import homeMetadata from "@pages/home/metadata";
import kvMetadata from "@pages/kv/metadata";
import linksMetadata from "@pages/links/metadata";
import pagesMetadata from "@pages/pages/metadata";
import profileMetadata from "@pages/profile/metadata";
import setupMetadata from "@pages/setup/metadata";
import usersMetadata from "@pages/users/metadata";
import type { PageMetadata } from "@utils/types/page";

const HomePage = lazy(() => import("@pages/home"));
const AuthPage = lazy(() => import("@pages/auth"));
const SetupPage = lazy(() => import("@pages/setup"));
const AppDetailsPage = lazy(() => import("@pages/appDetails"));
const BrandPage = lazy(() => import("@pages/brand"));
const UsersPage = lazy(() => import("@pages/users"));
const ProfilePage = lazy(() => import("@pages/profile"));
const KvPage = lazy(() => import("@pages/kv"));
const PagesPage = lazy(() => import("@pages/pages"));
const LinksPage = lazy(() => import("@pages/links"));

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
  pageRoute("/id", BrandPage, brandMetadata),
  {
    element: <AppLayout />,
    children: [
      pageRoute("/", HomePage, homeMetadata),
      pageRoute("/auth", AuthPage, authMetadata),
      pageRoute("/setup", SetupPage, setupMetadata),
      pageRoute("/apps/:applicationId", AppDetailsPage, appDetailsMetadata),
      pageRoute("/kv", KvPage, kvMetadata),
      pageRoute("/pages", PagesPage, pagesMetadata),
      pageRoute("/links", LinksPage, linksMetadata),
      pageRoute("/users", UsersPage, usersMetadata),
      pageRoute("/profile", ProfilePage, profileMetadata),
      { path: "*", element: <Navigate to="/" replace /> }
    ]
  }
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
