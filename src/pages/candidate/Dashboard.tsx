import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Grid, Paper, Typography, Button, Chip } from '@mui/material';
import { Award, Share2, Shield, Clock } from 'lucide-react';
import { useIndexedDB } from '../../hooks/useIndexedDB';
import { RootState } from '../../store';
import toast from 'react-hot-toast';

const CandidateDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { getCertificatesByCandidate, getAccessRequestsByStatus, updateAccessRequest } = useIndexedDB();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        const certs = await getCertificatesByCandidate(user.id);
        setCertificates(certs);

        const pending = await getAccessRequestsByStatus('pending');
        setPendingRequests(pending.filter(req => 
          certs.some(cert => cert.id === req.certificateId)
        ));
      }
    };

    fetchData();
  }, [user?.id, getCertificatesByCandidate, getAccessRequestsByStatus]);

  const handleShareCertificate = (certId: string) => {
    // In a real app, this would open a sharing dialog
    toast.success('Sharing functionality will be implemented soon!');
  };

  const handleAccessRequest = async (requestId: string, status: 'approved' | 'denied') => {
    try {
      const request = pendingRequests.find(req => req.id === requestId);
      if (request) {
        await updateAccessRequest({
          ...request,
          status,
          updateDate: new Date().toISOString()
        });
        
        // Update UI
        setPendingRequests(prev => prev.filter(req => req.id !== requestId));
        toast.success(`Request ${status} successfully`);
      }
    } catch (error) {
      toast.error('Failed to update request status');
    }
  };

  return (
    <Box sx={{ pt: 8 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Certificate Wallet
      </Typography>

      <Grid container spacing={3}>
        {/* Certificates Grid */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            My Certificates
          </Typography>
          <Grid container spacing={2}>
            {certificates.map((cert) => (
              <Grid item xs={12} md={4} key={cert.id}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Award size={24} />
                    <Typography variant="h6">{cert.title}</Typography>
                  </Box>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    Issue Date: {new Date(cert.issueDate).toLocaleDateString()}
                  </Typography>
                  {cert.expiryDate && (
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                    <Chip
                      label={cert.status}
                      color={cert.status === 'active' ? 'success' : 'error'}
                      size="small"
                    />
                    <Button
                      startIcon={<Share2 size={16} />}
                      variant="outlined"
                      size="small"
                      onClick={() => handleShareCertificate(cert.id)}
                    >
                      Share
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Pending Requests */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Pending Access Requests
            </Typography>
            <Grid container spacing={2}>
              {pendingRequests.map((request) => (
                <Grid item xs={12} key={request.id}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Shield size={24} />
                      <Box>
                        <Typography variant="body1">
                          Organization Request
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Requested on: {new Date(request.requestDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleAccessRequest(request.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleAccessRequest(request.id, 'denied')}
                      >
                        Deny
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
              {pendingRequests.length === 0 && (
                <Grid item xs={12}>
                  <Typography color="text.secondary" textAlign="center">
                    No pending requests
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

export default CandidateDashboard;