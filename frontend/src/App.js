import React, { useState, useEffect } from 'react';
import { TextField, Button, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, InputAdornment, Snackbar, LinearProgress } from '@mui/material';
import { Alert } from '@mui/material';
import axios from 'axios';

const API_URL = 'https://timeboxingapps2.vercel.app/backend/server';  // Update with your backend URL

const projectLimits = {
  small: 7,    // 1 week
  medium: 14,  // 2 weeks
  large: 28    // 4 weeks
};

function App() {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [projectSize, setProjectSize] = useState('small');
  const [timeSpent, setTimeSpent] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(API_URL);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects', error);
    }
  };

  const addProject = async () => {
    if (!projectName || !projectSize) {
      setSnackbarMessage('Please provide all fields');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const newProject = {
      name: projectName,
      size: projectSize,
      timeLimit: projectLimits[projectSize],  // Add timeLimit here
    };

    try {
      const response = await axios.post(API_URL, newProject);
      setProjects([...projects, response.data]);
      setProjectName('');
      setProjectSize('small');
    } catch (error) {
      setSnackbarMessage('Error adding project');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleTimeChange = async (index, value) => {
    const updatedProjects = [...projects];
    updatedProjects[index].timeSpent = value;
    setProjects(updatedProjects);

    try {
      await axios.put(`${API_URL}/${projects[index]._id}`, { timeSpent: value });
      validateTimeLimit(index, value);
    } catch (error) {
      setSnackbarMessage('Error updating time');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const validateTimeLimit = (index, value) => {
    if (value > projects[index].timeLimit) {
      setSnackbarMessage('Time limit exceeded! Please choose an option.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const finishProject = async (index) => {
    try {
      await axios.delete(`${API_URL}/${projects[index]._id}`);
      const updatedProjects = [...projects];
      updatedProjects.splice(index, 1);
      setProjects(updatedProjects);
      setSnackbarMessage('Project finished.');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (error) {
      setSnackbarMessage('Error finishing project');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f6f8' }}>
      <h1 style={{ textAlign: 'center' }}>TimeBound Project Management System</h1>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <TextField
          label="Project Name"
          variant="outlined"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <Select
          value={projectSize}
          onChange={(e) => setProjectSize(e.target.value)}
          variant="outlined"
          style={{ marginRight: '10px' }}
        >
          <MenuItem value="small">Small</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="large">Large</MenuItem>
        </Select>
        <Button
          variant="contained"
          color="primary"
          onClick={addProject}
        >
          Add Project
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project</TableCell>
              <TableCell>Time Limit</TableCell>
              <TableCell>Time Spent</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project, index) => (
              <TableRow key={index}>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.timeLimit} days</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={project.timeSpent}
                    onChange={(e) => handleTimeChange(index, parseInt(e.target.value))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">hrs</InputAdornment>
                    }}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <LinearProgress variant="determinate" value={(project.timeSpent / project.timeLimit) * 100} />
                </TableCell>
                <TableCell>
                  <Button variant="contained" color="success" onClick={() => finishProject(index)}>Finish</Button>
                  <Button variant="contained" color="error" onClick={() => finishProject(index)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
