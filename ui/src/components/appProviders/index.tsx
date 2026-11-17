import { Theme } from "@radix-ui/themes";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "styled-components";

import { getProfile } from "@actions/auth";
import AppRouter from "@routes/index";
import useAuthStore from "@stores/auth";
import GlobalStyles from "@styles/global";
import theme, { radixTheme } from "@styles/theme";
import { createLocalLogger } from "@utils/functions";

const logger = createLocalLogger("appProviders");

const AppProviders = () => {
  const { token, setUser } = useAuthStore();

  useEffect(() => {
    if (!token) return;
    getProfile().then(setUser).catch(logger.warn);
  }, [token, setUser]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Theme {...radixTheme}>
        <AppRouter />
      </Theme>
      <ToastContainer position="bottom-right" theme="dark" newestOnTop />
    </ThemeProvider>
  );
};

export default AppProviders;
