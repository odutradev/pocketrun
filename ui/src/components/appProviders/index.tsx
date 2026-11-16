import { Theme } from "@radix-ui/themes";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "styled-components";

import { getProfile } from "@actions/auth";
import AppRouter from "@routes/index";
import useAuthStore from "@stores/auth";
import useSystemStore from "@stores/system";
import theme, { radixTheme } from "@styles/theme";
import { createLocalLogger } from "@utils/functions";

const logger = createLocalLogger("appProviders");

const AppProviders: React.FC = () => {
  const { theme: appearance } = useSystemStore();
  const { token, setUser } = useAuthStore();

  useEffect(() => {
    if (!token) return;
    getProfile().then(setUser).catch(logger.warn);
  }, [token, setUser]);

  return (
    <ThemeProvider theme={theme}>
      <Theme appearance={appearance} {...radixTheme}>
        <AppRouter />
      </Theme>
      <ToastContainer position="bottom-right" theme={appearance} newestOnTop />
    </ThemeProvider>
  );
};

export default AppProviders;
