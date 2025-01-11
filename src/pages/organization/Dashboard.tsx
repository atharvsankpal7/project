import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, Grid, Paper, Typography, Button, TextField, Chip } from '@mui/material';
import { Search, FileCheck, BarChart2, Clock } from 'lucide-react';
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
import toast from 'react-hot-toast';

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
  const [certificateId, setCertificateId] = useState('');
  const [verifiedCertificates, setVerifiedCertificates] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalVerifications: 0,
    successRate: 0,
    pendingRequests: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        const requests = await getAccessRequestsByStatus('approved');
        const verifiedCerts = requests.filter(req => req.requesterId === user.id);
        setVerifiedCertificates(verifiedCerts);
        
        const pending = await getAccessRequestsByStatus('pending');
        const pendingCount = pending.filter(req => req.requesterId === user.id).length;
        
        setStats({
          totalVerifications: verifiedCerts.length,
          successRate: verifiedCerts.length > 0 ? 
            Math.round((verifiedCerts.length / (verifiedCerts.length + pendingCount)) * 100) : 0,
          pendingRequests: pendingCount
        });
      }
    };

    fetchData();
  }, [user?.id, getAccessRequestsByStatus]);

  const handleVerify = async () => {
    if (!certificateId.trim()) {
      toast.error('Please enter a certificate ID');
      return;
    }

    try {
      // Check if certificate exists
      const cert = await db?.get('certificates', certificateId);
      if (!cert) {
        toast.error('Certificate not found');
        return;
      }

      // Create access request
      const request = {
        id: crypto.randomUUID(),
        certificateId,
        requesterId: user?.id || '',
        status: 'pending',
        requestDate: new Date().toISOString()
      };

      await addAccessRequest(request);
      toast.success('Verification request submitted successfully');
      setCertificateId('');
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingRequests: prev.pendingRequests + 1
      }));
    } catch (error) {
      toast.error('Failed to submit verification request');
    }
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Verification Requests',
      data: Array(6).fill(0).map((_, i) => {
        const month = new Date().getMonth() - (5 - i);
        return verifiedCertificates.filter(cert => {
          const certDate = new Date(cert.requestDate);
          return certDate.getMonth() === month;
        }).length;
      }),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    }],
  };

  return (
    <Box sx={{ pt: 8 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Organization Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Certificate Verification Form */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Verify Certificate
            </Typography>
            <Box
              component="form"
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
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

        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
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
              display: 'flex',
              alignItems: 'center',
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
              display: 'flex',
              alignItems: 'center',
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

        {/* Analytics Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Line
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Verification Request Trend',
                  },
                },
              }}
              data={chartData}
            />
          </Paper>
        </Grid>

        {/* Verified Certificates List */}
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
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography variant="body1">
                        Certificate ID: {cert.certificateId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Verified on: {new Date(cert.requestDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
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
    </Box>
  );
};

export default OrganizationDashboard;