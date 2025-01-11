import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Chip,
  List,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
} from "@mui/material";
import { Search, FileCheck, BarChart2, Clock, Bell } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useIndexedDB } from "../../hooks/useIndexedDB";
import { RootState } from "../../store";
import toast from "react-hot-toast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const OrganizationDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { db, getAccessRequestsByStatus, addAccessRequest } = useIndexedDB();
  const [certificateId, setCertificateId] = useState("");
  const [verifiedCertificates, setVerifiedCertificates] = useState<any[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalVerifications: 0,
    successRate: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        const [approved, denied, pending] = await Promise.all([
          getAccessRequestsByStatus("approved"),
          getAccessRequestsByStatus("denied"),
          getAccessRequestsByStatus("pending"),
        ]);

        const orgApproved = approved.filter(
          (req) => req.requesterId === user.id
        );
        const orgDenied = denied.filter((req) => req.requesterId === user.id);
        const orgPending = pending.filter((req) => req.requesterId === user.id);

        setVerifiedCertificates(orgApproved);

        const allNotifications = [...orgApproved, ...orgDenied]
          .sort(
            (a, b) =>
              new Date(b.requestDate).getTime() -
              new Date(a.requestDate).getTime()
          )
          .slice(0, 10);
        setNotifications(allNotifications);

        const total = orgApproved.length + orgDenied.length;
        setStats({
          totalVerifications: orgApproved.length,
          successRate:
            total > 0 ? Math.round((orgApproved.length / total) * 100) : 0,
          pendingRequests: orgPending.length,
        });
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user?.id, getAccessRequestsByStatus]);

  const handleVerify = async () => {
    if (!certificateId.trim()) {
      toast.error("Please enter a certificate ID");
      return;
    }

    try {
      const cert = await db?.get("certificates", certificateId);
      if (!cert) {
        toast.error("Certificate not found");
        return;
      }

      const request = {
        id: crypto.randomUUID(),
        certificateId,
        requesterId: user?.id || "",
        status: "pending" as const,
        requestDate: new Date().toISOString(),
      };

      await addAccessRequest(request);
      toast.success("Verification request submitted successfully");
      setCertificateId("");

      setStats((prev) => ({
        ...prev,
        pendingRequests: prev.pendingRequests + 1,
      }));
    } catch (error) {
      toast.error("Failed to submit verification request");
    }
  };

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Verification Requests",
        data: Array(6)
          .fill(0)
          .map((_, i) => {
            const month = new Date().getMonth() - (5 - i);
            return verifiedCertificates.filter((cert) => {
              const certDate = new Date(cert.requestDate);
              return certDate.getMonth() === month;
            }).length;
          }),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  return (
    <Box sx={{ pt: 8 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4">Organization Dashboard</Typography>
        <Button
          startIcon={
            <Badge badgeContent={notifications.length} color="error">
              <Bell size={20} />
            </Badge>
          }
          onClick={() => setNotificationOpen(true)}
          variant="outlined"
        >
          Notifications
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Verify Certificate
            </Typography>
            <Box
              component="form"
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
              }}
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify();
              }}
            >
              <TextField
                label="Certificate ID"
                variant="outlined"
                size="small"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="contained"
                startIcon={<Search size={20} />}
                onClick={handleVerify}
              >
                Verify
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <FileCheck size={40} className="text-blue-500" />
            <Box>
              <Typography variant="h6">Total Verifications</Typography>
              <Typography variant="h4">{stats.totalVerifications}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <BarChart2 size={40} className="text-green-500" />
            <Box>
              <Typography variant="h6">Success Rate</Typography>
              <Typography variant="h4">{stats.successRate}%</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Clock size={40} className="text-orange-500" />
            <Box>
              <Typography variant="h6">Pending Requests</Typography>
              <Typography variant="h4">{stats.pendingRequests}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Line
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                  title: {
                    display: true,
                    text: "Verification Request Trend",
                  },
                },
              }}
              data={chartData}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recently Verified Certificates
            </Typography>
            <Grid container spacing={2}>
              {verifiedCertificates.slice(0, 5).map((cert) => (
                <Grid item xs={12} key={cert.id}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="body1">
                        Certificate ID: {cert.certificateId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Verified on:{" "}
                        {new Date(cert.requestDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                      }}
                    >
                      <Chip
                        label="Verified"
                        color="success"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              ))}
              {verifiedCertificates.length === 0 && (
                <Grid item xs={12}>
                  <Typography color="text.secondary" textAlign="center">
                    No certificates verified yet
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Access Request Notifications</DialogTitle>
        <DialogContent>
          {notifications.length > 0 ? (
            <List>
              {notifications.map((notification) => (
                <Paper
                  key={notification.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {notification.status === "approved" ? (
                      <FileCheck size={20} className="text-green-500" />
                    ) : (
                      <Clock size={20} className="text-red-500" />
                    )}
                    <Box>
                      <Typography variant="body1">
                        Certificate Access Request {notification.status}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(
                          notification.updateDate || notification.requestDate
                        ).toLocaleString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={notification.status}
                      color={
                        notification.status === "approved" ? "success" : "error"
                      }
                      size="small"
                      sx={{ ml: "auto" }}
                    />
                  </Box>
                </Paper>
              ))}
            </List>
          ) : (
            <Typography
              color="text.secondary"
              textAlign="center"
              sx={{ py: 3 }}
            >
              No notifications yet
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizationDashboard;
