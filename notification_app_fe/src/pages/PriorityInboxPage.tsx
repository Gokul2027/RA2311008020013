import { useState } from "react";
import {
  Alert,
  Box,
  Chip,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  Stack,
  Typography
} from "@mui/material";
import { NotificationCard } from "../components/NotificationCard";
import { Log } from "../config/logger";
import { useNotifications } from "../hooks/useNotifications";
import { usePriorityInbox } from "../hooks/usePriorityInbox";
import { useNotificationContext } from "../state/NotificationContext";

const FETCH_LIMIT = 120;
const TOP_N_OPTIONS = [10, 15, 20];

export function PriorityInboxPage() {
  const [topN, setTopN] = useState(10);
  const { readIds } = useNotificationContext();
  const { data, error, loading, refetch } = useNotifications({});
  const rankedNotifications = usePriorityInbox(data, topN, readIds);

  function handleTopNChange(event: SelectChangeEvent<number>) {
    const nextValue = Number(event.target.value);
    setTopN(nextValue);
    void Log("frontend", "info", "page", `Priority inbox top-N changed to ${nextValue}`);
  }

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          background: "linear-gradient(135deg, rgba(199,119,42,0.96) 0%, rgba(242,173,96,0.88) 100%)",
          borderRadius: 6,
          color: "#fff",
          overflow: "hidden",
          p: { xs: 3, md: 4 },
          position: "relative"
        }}
      >
        <Box
          sx={{
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: "50%",
            height: 260,
            position: "absolute",
            right: -96,
            top: -96,
            width: 260
          }}
        />
        <Stack spacing={2} sx={{ position: "relative" }}>
          <Chip
            label="Priority Inbox"
            sx={{ alignSelf: "flex-start", bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }}
          />
          <Typography variant="h3">Start with the updates that deserve attention first.</Typography>
          <Typography sx={{ fontSize: "1.05rem", maxWidth: 720, opacity: 0.92 }}>
            Placement notices get the strongest weight, results follow, and event reminders are softened by
            time. Once a card is marked as read, it gracefully steps out of this queue.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Chip
              label={`${rankedNotifications.length} ranked now`}
              sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }}
            />
            <Chip
              label={`${readIds.size} already handled`}
              sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }}
            />
            <Chip
              label="Score = type weight + recency"
              sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }}
            />
          </Stack>
        </Stack>
      </Box>

      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
        sx={{
          backgroundColor: "rgba(255,255,255,0.62)",
          border: "1px solid rgba(19,34,56,0.08)",
          borderRadius: 5,
          p: 2.5
        }}
      >
        <Box>
          <Typography variant="h5">Ranking Controls</Typography>
          <Typography color="text.secondary" variant="body2">
            Choose how many notifications you want to surface and refresh whenever you want to re-evaluate the
            inbox against the latest feed.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <Select<number> onChange={handleTopNChange} value={topN}>
              {TOP_N_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  Top {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Chip color="secondary" label={`${rankedNotifications.length} visible`} />
          <Chip
            clickable
            color="primary"
            label="Refresh ranking"
            onClick={() => {
              refetch();
              void Log("frontend", "info", "page", "Manual refresh triggered on priority inbox page");
            }}
          />
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Box
          sx={{
            backgroundColor: "rgba(255,255,255,0.62)",
            border: "1px solid rgba(19,34,56,0.08)",
            borderRadius: 5,
            flex: 1,
            p: 2.5
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Weighting Logic
          </Typography>
          <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
            <Chip color="primary" label="Placement = 30" />
            <Chip color="warning" label="Result = 20" />
            <Chip color="success" label="Event = 10" />
            <Chip label="Recency = 10 / (hours + 1)" variant="outlined" />
          </Stack>
        </Box>
      </Stack>

      {loading ? (
        <Stack spacing={2}>
          <Skeleton height={150} variant="rounded" />
          <Skeleton height={150} variant="rounded" />
          <Skeleton height={150} variant="rounded" />
        </Stack>
      ) : null}

      {!loading && error ? <Alert severity="error">{error}</Alert> : null}

      {!loading && !error && rankedNotifications.length === 0 ? (
        <Alert severity="info">No unread notifications are available for ranking right now.</Alert>
      ) : null}

      {!loading && !error ? (
        <Stack spacing={2}>
          {rankedNotifications.map((notification, index) => (
            <NotificationCard
              key={notification.ID}
              notification={notification}
              rank={index + 1}
              score={notification.score}
            />
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}
