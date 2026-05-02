import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import { Link as RouterLink, useLocation } from "react-router-dom";

export function NavBar() {
  const { pathname } = useLocation();

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: 2, py: 1 }}>
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            gap: 1.5
          }}
        >
          <Box
            sx={{
              alignItems: "center",
              background: "linear-gradient(135deg, #f2ad60 0%, #c7772a 100%)",
              borderRadius: "16px",
              color: "#fff",
              display: "grid",
              height: 42,
              placeItems: "center",
              width: 42
            }}
          >
            <AutoAwesomeIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              Campus Notification Hub
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)" }}>
              A calmer way to keep up with what matters
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
          <Button
            color="inherit"
            component={RouterLink}
            startIcon={<InboxRoundedIcon />}
            sx={{
              backgroundColor: pathname === "/" ? "rgba(255,255,255,0.16)" : "transparent",
              px: 2
            }}
            to="/"
          >
            All Updates
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            startIcon={<LocalFireDepartmentRoundedIcon />}
            sx={{
              backgroundColor: pathname === "/priority" ? "rgba(255,255,255,0.16)" : "transparent",
              px: 2
            }}
            to="/priority"
          >
            Priority Inbox
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

