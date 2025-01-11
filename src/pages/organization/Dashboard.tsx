import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Search, FileCheck, BarChart2, Clock, User, Award } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [verifiedCertificates, setVerifiedCertificates] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const searchCandidates = async () => {
    if (!searchQuery.trim() || !db) {
      setCandidates([]);
      return;
    }

    try {
      const tx = db.transaction('users', 'readonly');
      const userStore = tx.store;
      const candidateIndex = userStore.index('by-role');
      const allCandidates = await candidateIndex.getAll('candidate');
      
      // Filter candidates based on search query
      const filteredCandidates = allCandidates.filter(candidate =>
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setCandidates(filteredCandidates);
    } catch (error) {
      console.error('Error searching candidates:', error);
      toast.error('Failed to search candidates');
    }
  };

  const handleCandidateSelect = async (candidate: any) => {
    setSelectedCandidate(candidate);
    try {
      if (!db) return;
      
      const tx = db.transaction('certificates', 'readonly');
      const certStore = tx.store;
      const candidateCerts = await certStore.index('by-candidate').getAll(candidate.id);
      setCertificates(candidateCerts);
      setDialogOpen(true);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to fetch candidate certificates');
    }
  };

  const requestAccess = async (certificateId: string) => {
    if (!user?.id || !selectedCandidate) return;

    try {
      // Check if request already exists
      const existingRequests = await getAccessRequestsByStatus('pending');
      const hasExisting = existingRequests.some(
        req => req.certificateId === certificateId && req.requesterId === user.id
      );

      if (hasExisting) {
        toast.error('Access request already pending');
        return;
      }

      const request = {
        id: crypto.randomUUID(),
        certificateId,
        requesterId: user.id,
        status: 'pending',
        requestDate: new Date().toISOString()
      };

      await addAccessRequest(request);
      toast.success('Access request sent successfully');
      setStats(prev => ({
        ...prev,
        pendingRequests: prev.pendingRequests + 1
      }));
    } catch (error) {
      console.error('Error requesting access:', error);
      toast.error('Failed to send access request');
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
        {/* Candidate Search */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Search Candidates
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Search by name or email"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchCandidates()}
              />
              <Button
                variant="contained"
                startIcon={<Search size={20} />}
                onClick={searchCandidates}
              >
                Search
              </Button>
            </Box>

            {candidates.length > 0 && (
              <List sx={{ mt: 2 }}>
                {candidates.map((candidate) => (
                  <ListItem
                    key={candidate.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={candidate.name}
                      secondary={candidate.email}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<User size={16} />}
                      onClick={() => handleCandidateSelect(candidate)}
                    >
                      View Certificates
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <FileCheck size={40} className="text-blue-500" />
            <Box>
              <Typography variant="h6">Total Verifications</Typography>
              <Typography variant="h4">{stats.totalVerifications}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <BarChart2 size={40} className="text-green-500" />
            <Box>
              <Typography variant="h6">Success Rate</Typography>
              <Typography variant="h4">{stats.successRate}%</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
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

        {/* Verified Certificates */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recently Verified Certificates
            </Typography>
            <List>
              {verifiedCertificates.slice(0, 5).map((cert) => (
                <ListItem
                  key={cert.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={`Certificate ID: ${cert.certificateId}`}
                    secondary={`Verified on: ${new Date(cert.requestDate).toLocaleDateString()}`}
                  />
                  <Chip label="Verified" color="success" size="small" />
                </ListItem>
              ))}
              {verifiedCertificates.length === 0 && (
                <Typography color="text.secondary" textAlign="center">
                  No certificates verified yet
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Certificate Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Certificates for {selectedCandidate?.name}
        </DialogTitle>
        <DialogContent>
          {certificates.length > 0 ? (
            <List>
              {certificates.map((cert) => (
                <ListItem
                  key={cert.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={cert.title}
                    secondary={`Issued: ${new Date(cert.issueDate).toLocaleDateString()}`}
                  />
                  <Button
                    variant="contained"
                    startIcon={<Award size={16} />}
                    onClick={() => requestAccess(cert.id)}
                  >
                    Request Access
                  </Button>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" textAlign="center">
              No certificates found for this candidate
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizationDashboard;