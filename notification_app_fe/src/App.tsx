import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  CssBaseline,
  Stack,
  ThemeProvider,
  Typography
} from "@mui/material";
import { Route, Routes, useLocation } from "react-router-dom";
import { initAuth } from "./config/auth";
import { Log } from "./config/logger";
import { NavBar } from "./components/NavBar";
import { AllNotificationsPage } from "./pages/AllNotificationsPage";
import { PriorityInboxPage } from "./pages/PriorityInboxPage";
import { appTheme } from "./styles/theme";

function RouteLogger() {
  const { pathname } = useLocation();

  useEffect(() => {
    void Log("frontend", "info", "page", `Route viewed: ${pathname}`);
  }, [pathname]);

  return null;
}

export default function App() {
  const [authError, setAuthError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initAuth()
      .then(() => setReady(true))
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Authentication failed";
        setAuthError(message);
      });
  }, []);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <RouteLogger />
      <NavBar />

      <Container maxWidth="lg" sx={{ pb: 6, pt: { xs: 3, md: 5 } }}>
        {authError ? (
          <Box
            sx={{
              backgroundColor: "rgba(255,255,255,0.72)",
              border: "1px solid rgba(19,34,56,0.08)",
              borderRadius: 5,
              p: 3
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="h5">Authentication could not be completed</Typography>
              <Alert severity="error">{authError}</Alert>
              <Typography color="text.secondary" variant="body2">
                Add your values to `notification_app_fe/.env`, restart the Vite server, and the app should be
                ready to fetch notifications.
              </Typography>
            </Stack>
          </Box>
        ) : null}

        {!authError && !ready ? (
          <Stack alignItems="center" spacing={2} sx={{ py: 12 }}>
            <CircularProgress color="secondary" />
            <Typography color="text.secondary">Connecting to the evaluation service…</Typography>
          </Stack>
        ) : null}

        {!authError && ready ? (
          <Routes>
            <Route element={<AllNotificationsPage />} path="/" />
            <Route element={<PriorityInboxPage />} path="/priority" />
          </Routes>
        ) : null}
      </Container>
    </ThemeProvider>
  );
}
