import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { FileText, Plus, Copy, Edit, Trash } from 'lucide-react';

const Templates = () => {
  const templates = [
    {
      id: '1',
      name: 'Professional Certificate',
      description: 'Standard professional certification template with company branding',
      lastModified: '2024-02-20',
    },
    {
      id: '2',
      name: 'Course Completion',
      description: 'Template for course completion certificates',
      lastModified: '2024-02-18',
    },
    {
      id: '3',
      name: 'Achievement Award',
      description: 'Special achievement recognition template',
      lastModified: '2024-02-15',
    },
  ];

  return (
    <Box sx={{ pt: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Certificate Templates</Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
        >
          Create Template
        </Button>
      </Box>

      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} md={4} key={template.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <FileText size={24} className="text-primary" />
                  <Typography variant="h6">{template.name}</Typography>
                </Box>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last modified: {template.lastModified}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<Copy size={16} />}
                >
                  Duplicate
                </Button>
                <Button
                  size="small"
                  startIcon={<Edit size={16} />}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<Trash size={16} />}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Templates;