import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Award, Send } from 'lucide-react';
import { addCertificate } from '../../store/slices/certificatesSlice';
import { useIndexedDB } from '../../hooks/useIndexedDB';
import { RootState } from '../../store';
import toast from 'react-hot-toast';

const steps = ['Select Candidate', 'Certificate Details', 'Review & Issue'];

const IssueCertificate = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { db } = useIndexedDB();
  const [activeStep, setActiveStep] = useState(0);
  const [candidates, setCandidates] = useState<Array<{
    id: string;
    name: string;
    email: string;
  }>>([]);
  const [formData, setFormData] = useState({
    candidateId: '',
    title: '',
    description: '',
    validityPeriod: '12',
    skills: '',
    grade: '',
  });

  useEffect(() => {
    const fetchCandidates = async () => {
      if (db) {
        try {
          // Get all users with role 'candidate'
          const allCandidates = await db.getAllFromIndex('users', 'by-role', 'candidate');
          setCandidates(allCandidates);
        } catch (error) {
          console.error('Error fetching candidates:', error);
          toast.error('Failed to load candidates');
        }
      }
    };

    fetchCandidates();
  }, [db]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Issuer ID not found');
      return;
    }

    const certificate = {
      id: crypto.randomUUID(),
      title: formData.title,
      issuerId: user.id,
      candidateId: formData.candidateId,
      issueDate: new Date().toISOString(),
      expiryDate: formData.validityPeriod === '0' ? undefined : 
        new Date(Date.now() + parseInt(formData.validityPeriod) * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active' as const,
      metadata: {
        description: formData.description,
        skills: formData.skills.split(',').map(skill => skill.trim()),
        grade: formData.grade,
      },
    };

    try {
      await db?.add('certificates', certificate);
      dispatch(addCertificate(certificate));
      toast.success('Certificate issued successfully!');
      setFormData({
        candidateId: '',
        title: '',
        description: '',
        validityPeriod: '12',
        skills: '',
        grade: '',
      });
      setActiveStep(0);
    } catch (error) {
      console.error('Error issuing certificate:', error);
      toast.error('Failed to issue certificate');
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <FormControl fullWidth>
              <InputLabel>Select Candidate</InputLabel>
              <Select
                name="candidateId"
                value={formData.candidateId}
                label="Select Candidate"
                onChange={handleChange}
              >
                {candidates.map(candidate => (
                  <MenuItem key={candidate.id} value={candidate.id}>
                    {candidate.name} ({candidate.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {candidates.length === 0 && (
              <Typography color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                No registered candidates found. Candidates will appear here after they log in.
              </Typography>
            )}
          </Box>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Certificate Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Skills (comma-separated)"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                helperText="Enter skills separated by commas"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Grade/Score"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Validity Period (months)</InputLabel>
                <Select
                  name="validityPeriod"
                  value={formData.validityPeriod}
                  label="Validity Period (months)"
                  onChange={handleChange}
                >
                  <MenuItem value="12">1 Year</MenuItem>
                  <MenuItem value="24">2 Years</MenuItem>
                  <MenuItem value="36">3 Years</MenuItem>
                  <MenuItem value="60">5 Years</MenuItem>
                  <MenuItem value="0">No Expiry</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 2:
        const selectedCandidate = candidates.find(c => c.id === formData.candidateId);
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Review Certificate Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Candidate</Typography>
                  <Typography>{selectedCandidate?.name} ({selectedCandidate?.email})</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Certificate Title</Typography>
                  <Typography>{formData.title}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography>{formData.description}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Skills</Typography>
                  <Typography>{formData.skills}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Grade/Score</Typography>
                  <Typography>{formData.grade}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Validity Period</Typography>
                  <Typography>
                    {formData.validityPeriod === '0' 
                      ? 'No Expiry' 
                      : `${parseInt(formData.validityPeriod) / 12} Year${parseInt(formData.validityPeriod) > 12 ? 's' : ''}`
                    }
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ pt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Award size={32} className="text-primary" />
          <Typography variant="h4">Issue New Certificate</Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mt: 4, mb: 4 }}>
            {getStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {activeStep > 0 && (
              <Button onClick={handleBack}>
                Back
              </Button>
            )}
            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                startIcon={<Send size={20} />}
                disabled={!formData.candidateId}
              >
                Issue Certificate
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  (activeStep === 0 && !formData.candidateId) ||
                  (activeStep === 1 && (!formData.title || !formData.description || !formData.skills || !formData.grade))
                }
              >
                Next
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default IssueCertificate;