import { ThemeProvider } from "styled-components";
import { ToastContainer } from "react-toastify";
import { Theme } from "@radix-ui/themes";
import { useEffect } from "react";

import { createLocalLogger } from "@utils/functions";
import theme, { radixTheme } from "@styles/theme";
import { getProfile } from "@actions/auth";
import GlobalStyles from "@styles/global";
import useAuthStore from "@stores/auth";
import AppRouter from "@routes/index";



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
