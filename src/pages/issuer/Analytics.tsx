import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Certificates Issued',
        data: [12, 19, 15, 25, 22, 30],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const categoryData = {
    labels: ['Web Development', 'Data Science', 'Cloud Computing', 'Cybersecurity', 'AI/ML'],
    datasets: [
      {
        label: 'Certificates by Category',
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
      },
    ],
  };

  const recentCertificates = [
    {
      id: '1',
      candidate: 'John Doe',
      certificate: 'Web Development',
      issueDate: '2024-02-20',
      status: 'Active',
    },
    {
      id: '2',
      candidate: 'Jane Smith',
      certificate: 'Data Science',
      issueDate: '2024-02-19',
      status: 'Active',
    },
    {
      id: '3',
      candidate: 'Alice Johnson',
      certificate: 'Cloud Computing',
      issueDate: '2024-02-18',
      status: 'Active',
    },
  ];

  return (
    <Box sx={{ pt: 8 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Monthly Certificates Issued</Typography>
            <Line
              data={monthlyData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Certificates by Category</Typography>
            <Bar
              data={categoryData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Recent Certificates</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Candidate</TableCell>
                    <TableCell>Certificate</TableCell>
                    <TableCell>Issue Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentCertificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell>{cert.candidate}</TableCell>
                      <TableCell>{cert.certificate}</TableCell>
                      <TableCell>{cert.issueDate}</TableCell>
                      <TableCell>{cert.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;