import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    primary: {
      main: "#1f4b7b"
    },
    secondary: {
      main: "#c7772a"
    },
    success: {
      main: "#2f7d66"
    },
    warning: {
      main: "#c18b2e"
    },
    background: {
      default: "transparent",
      paper: "rgba(255, 252, 247, 0.82)"
    },
    text: {
      primary: "#132238",
      secondary: "#546173"
    }
  },
  shape: {
    borderRadius: 20
  },
  typography: {
    fontFamily: "\"Aptos\", \"Segoe UI Variable\", \"Trebuchet MS\", sans-serif",
    h3: {
      fontWeight: 800,
      letterSpacing: "-0.03em"
    },
    h4: {
      fontWeight: 800,
      letterSpacing: "-0.03em"
    },
    h5: {
      fontWeight: 700
    },
    button: {
      fontWeight: 700,
      textTransform: "none"
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(12, 26, 43, 0.84)",
          backdropFilter: "blur(18px)"
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(18px)",
          boxShadow: "0 18px 40px rgba(18, 42, 69, 0.08)"
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999
        }
      }
    }
  }
});

