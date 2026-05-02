import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  FormControl,
  MenuItem,
  Pagination,
  Select,
  SelectChangeEvent,
  Skeleton,
  Stack,
  Typography
} from "@mui/material";
import { NotificationType } from "../api/notifications";
import { NotificationCard } from "../components/NotificationCard";
import { Log } from "../config/logger";
import { useNotifications } from "../hooks/useNotifications";
import { useNotificationContext } from "../state/NotificationContext";

const PAGE_SIZE = 8;
const FETCH_LIMIT = 120;

export function AllNotificationsPage() {
  const [typeFilter, setTypeFilter] = useState<"All" | NotificationType>("All");
  const [page, setPage] = useState(1);
  const { readIds } = useNotificationContext();

  const { data, error, loading, refetch } = useNotifications({});

  const filteredNotifications =
    typeFilter === "All" ? data : data.filter((notification) => notification.Type === typeFilter);

  const pageCount = Math.max(1, Math.ceil(filteredNotifications.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const visibleNotifications = filteredNotifications.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const unreadCount = filteredNotifications.filter((notification) => !readIds.has(notification.ID)).length;
  const placementCount = data.filter((notification) => notification.Type === "Placement").length;

  function handleTypeChange(event: SelectChangeEvent) {
    const nextValue = event.target.value as "All" | NotificationType;
    setTypeFilter(nextValue);
    setPage(1);
    void Log("frontend", "info", "page", `All notifications filter changed to ${nextValue}`);
  }

  function handlePageChange(_: unknown, nextPage: number) {
    setPage(nextPage);
    void Log("frontend", "info", "page", `All notifications page changed to ${nextPage}`);
  }

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          background: "linear-gradient(135deg, rgba(31,75,123,0.96) 0%, rgba(51,114,178,0.85) 100%)",
          borderRadius: 6,
          color: "#fff",
          overflow: "hidden",
          p: { xs: 3, md: 4 },
          position: "relative"
        }}
      >
        <Box
          sx={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: "50%",
            height: 220,
            position: "absolute",
            right: -72,
            top: -80,
            width: 220
          }}
        />
        <Stack spacing={2} sx={{ position: "relative" }}>
          <Chip
            label="All Notifications"
            sx={{ alignSelf: "flex-start", bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }}
          />
          <Typography variant="h3">Stay caught up without feeling buried.</Typography>
          <Typography sx={{ fontSize: "1.05rem", maxWidth: 680, opacity: 0.9 }}>
            This view keeps the full feed tidy and readable, so you can scan everything while still spotting
            the messages that have not been opened yet.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Chip
              label={`${filteredNotifications.length} loaded`}
              sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }}
            />
            <Chip
              label={`${unreadCount} unread`}
              sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }}
            />
            <Chip
              label={`${placementCount} placement notices`}
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
          <Typography variant="h5">Feed Controls</Typography>
          <Typography color="text.secondary" variant="body2">
            Filter by type, flip through pages, and use the card action to mark messages as handled.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <FormControl size="small" sx={{ minWidth: 190 }}>
            <Select onChange={handleTypeChange} value={typeFilter}>
              <MenuItem value="All">All types</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>
          <Chip
            color="secondary"
            label={`Page ${currentPage} of ${pageCount}`}
            sx={{ alignSelf: { xs: "stretch", sm: "center" } }}
          />
          <Chip
            clickable
            color="primary"
            label="Refresh feed"
            onClick={() => {
              refetch();
              void Log("frontend", "info", "page", "Manual refresh triggered on all notifications page");
            }}
            sx={{ alignSelf: { xs: "stretch", sm: "center" } }}
          />
        </Stack>
      </Stack>

      {loading ? (
        <Stack spacing={2}>
          <Skeleton height={140} variant="rounded" />
          <Skeleton height={140} variant="rounded" />
          <Skeleton height={140} variant="rounded" />
        </Stack>
      ) : null}

      {!loading && error ? <Alert severity="error">{error}</Alert> : null}

      {!loading && !error && filteredNotifications.length === 0 ? (
        <Alert severity="info">No notifications were returned for the selected filter.</Alert>
      ) : null}

      {!loading && !error ? (
        <Stack spacing={2}>
          {visibleNotifications.map((notification) => (
            <NotificationCard key={notification.ID} notification={notification} />
          ))}
        </Stack>
      ) : null}

      {!loading && !error && filteredNotifications.length > 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
          <Pagination color="primary" count={pageCount} onChange={handlePageChange} page={currentPage} />
        </Box>
      ) : null}
    </Stack>
  );
}
