import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { Award, CheckCircle, XCircle, Activity } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useIndexedDB } from '../../hooks/useIndexedDB';
import { RootState } from '../../store';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const IssuerDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { getCertificatesByIssuer } = useIndexedDB();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    revoked: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        const certs = await getCertificatesByIssuer(user.id);
        setCertificates(certs);
        
        // Calculate stats
        setStats({
          total: certs.length,
          active: certs.filter(cert => cert.status === 'active').length,
          revoked: certs.filter(cert => cert.status === 'revoked').length
        });
      }
    };

    fetchData();
  }, [user?.id, getCertificatesByIssuer]);

  // Process data for chart
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Certificates Issued',
      data: Array(6).fill(0).map((_, i) => {
        const month = new Date().getMonth() - (5 - i);
        return certificates.filter(cert => {
          const certDate = new Date(cert.issueDate);
          return certDate.getMonth() === month;
        }).length;
      }),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Certificate Issuance Trend',
      },
    },
  };

  // Get recent activity
  const recentActivity = certificates
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 3)
    .map(cert => ({
      id: cert.id,
      title: `Certificate "${cert.title}" issued`,
      timestamp: new Date(cert.issueDate).toLocaleString(),
    }));

  return (
    <Box sx={{ pt: 8 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Issuer Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Award size={40} className="text-blue-500" />
            <Box>
              <Typography variant="h6">Total Certificates</Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CheckCircle size={40} className="text-green-500" />
            <Box>
              <Typography variant="h6">Active</Typography>
              <Typography variant="h4">{stats.active}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <XCircle size={40} className="text-red-500" />
            <Box>
              <Typography variant="h6">Revoked</Typography>
              <Typography variant="h4">{stats.revoked}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Line options={chartOptions} data={monthlyData} />
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Activity
            </Typography>
            {recentActivity.map((activity) => (
              <Box
                key={activity.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 2,
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                }}
              >
                <Activity size={24} />
                <Box>
                  <Typography variant="body1">
                    {activity.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.timestamp}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default IssuerDashboard;