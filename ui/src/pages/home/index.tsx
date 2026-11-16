import { useEffect } from "react";

import useHomePage from "./hook";
import HomeSkeleton from "./skeleton";
import { Container } from "./styles";
import ApplicationList from "./subcomponents/applicationList";
import AuthModal from "./subcomponents/authModal";
import CreateAppModal from "./subcomponents/createAppModal";
import DashboardHeader from "./subcomponents/dashboardHeader";
import SystemStatusGrid from "./subcomponents/systemStatusGrid";
import WelcomeBanner from "./subcomponents/welcomeBanner";

const HomePage: React.FC = () => {
  const { user, isLoading, loadApplications } = useHomePage();

  useEffect(() => {
    if (user) loadApplications();
  }, [user, loadApplications]);

  if (!user) {
    return (
      <Container>
        <WelcomeBanner />
        <AuthModal />
      </Container>
    );
  }

  return (
    <Container>
      <DashboardHeader />
      {isLoading ? (
        <HomeSkeleton />
      ) : (
        <>
          <SystemStatusGrid />
          <ApplicationList />
        </>
      )}
      <CreateAppModal />
    </Container>
  );
};

export default HomePage;
