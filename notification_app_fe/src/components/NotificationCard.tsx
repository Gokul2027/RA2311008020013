import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography
} from "@mui/material";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import { Notification } from "../api/notifications";
import { useNotificationContext } from "../state/NotificationContext";

type CardAccent = "primary" | "warning" | "success";

const TYPE_STYLES: Record<Notification["Type"], { border: string; color: CardAccent; copy: string }> = {
  Placement: { border: "#1f4b7b", color: "primary", copy: "Career-focused" },
  Result: { border: "#c18b2e", color: "warning", copy: "Outcome update" },
  Event: { border: "#2f7d66", color: "success", copy: "Upcoming event" }
};

function relativeTime(timestamp: string): string {
  const date = new Date(timestamp.replace(" ", "T"));
  const hours = Math.max(0, Math.round((Date.now() - date.getTime()) / 3_600_000));

  if (hours < 1) {
    return "Just arrived";
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

interface NotificationCardProps {
  notification: Notification;
  rank?: number;
  score?: number;
}

export function NotificationCard({ notification, rank, score }: NotificationCardProps) {
  const { isRead, markRead } = useNotificationContext();
  const read = isRead(notification.ID);
  const accent = TYPE_STYLES[notification.Type];

  return (
    <Card
      sx={{
        background: read
          ? "rgba(255, 255, 255, 0.68)"
          : "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,250,244,0.82) 100%)",
        border: "1px solid rgba(17, 35, 58, 0.08)",
        borderLeft: `6px solid`,
        borderLeftColor: read ? "rgba(84, 97, 115, 0.35)" : accent.border,
        opacity: read ? 0.72 : 1,
        transition: "transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease",
        "&:hover": {
          boxShadow: "0 22px 44px rgba(18, 42, 69, 0.12)",
          transform: "translateY(-2px)"
        }
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
            {typeof rank === "number" ? <Chip color="secondary" label={`#${rank}`} size="small" /> : null}
            <Chip color={accent.color} label={notification.Type} size="small" />
            <Chip
              icon={<MailRoundedIcon />}
              label={read ? "Read" : "Unread"}
              size="small"
              variant={read ? "outlined" : "filled"}
            />
            <Chip label={accent.copy} size="small" variant="outlined" />
            {typeof score === "number" ? (
              <Chip label={`Score ${score.toFixed(2)}`} size="small" variant="outlined" />
            ) : null}
          </Stack>

          <Button
            color="primary"
            disabled={read}
            onClick={() => markRead(notification.ID)}
            size="small"
            startIcon={<DoneRoundedIcon />}
            variant={read ? "text" : "contained"}
          >
            {read ? "Already read" : "Mark as read"}
          </Button>
        </Stack>

        <Typography sx={{ fontSize: "1.05rem", fontWeight: read ? 500 : 700, mt: 2 }}>
          {notification.Message}
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={1}
          sx={{ mt: 2 }}
        >
          <Box sx={{ color: "text.secondary", display: "flex", gap: 0.8, alignItems: "center" }}>
            <ScheduleRoundedIcon fontSize="small" />
            <Typography variant="body2">{relativeTime(notification.Timestamp)}</Typography>
          </Box>
          <Typography color="text.secondary" variant="body2">
            {notification.Timestamp}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
