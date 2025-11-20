const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = 5000; // Port for the backend server

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB (Replace with your MongoDB URL)
mongoose
  .connect("mongodb://localhost:27017/timebound", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// Schema for Project
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size: { type: String, enum: ["small", "medium", "large"], required: true },
  timeLimit: { type: Number, required: true },
  timeSpent: { type: Number, default: 0 },
});

const Project = mongoose.model("Project", projectSchema);

// API Routes

// GET all projects
app.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects); // Return all projects as JSON
  } catch (err) {
    res.status(500).json({ message: err.message }); // Error handling
  }
});

// POST a new project
app.post("/projects", async (req, res) => {
  const { name, size } = req.body;
  const timeLimits = { small: 7, medium: 14, large: 28 };

  // Validate project size
  if (!timeLimits[size]) {
    return res.status(400).json({ message: "Invalid project size" });
  }

  const timeLimit = timeLimits[size];

  // Validate required fields
  if (!name || !size) {
    return res.status(400).json({ message: "Project name and size are required" });
  }

  const project = new Project({
    name,
    size,
    timeLimit,
  });

  try {
    const newProject = await project.save(); // Save the new project to DB
    res.status(201).json(newProject); // Return the new project
  } catch (err) {
    res.status(400).json({ message: err.message }); // Error handling
  }
});

// PUT (update) a project
app.put("/projects/:id", async (req, res) => {
  const { id } = req.params;
  const { timeSpent } = req.body;

  try {
    const projectToUpdate = await Project.findById(id);

    if (!projectToUpdate) {
      return res.status(404).json({ message: "Project not found" }); // Handle project not found
    }

    // Validate time spent
    if (timeSpent > projectToUpdate.timeLimit) {
      return res.status(400).json({ message: "Time spent cannot exceed project time limit" });
    }

    projectToUpdate.timeSpent = timeSpent; // Update timeSpent field
    await projectToUpdate.save(); // Save the updated project

    res.status(200).json(projectToUpdate); // Return the updated project
  } catch (err) {
    res.status(400).json({ message: err.message }); // Error handling
  }
});

// DELETE a project
app.delete("/projects/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const projectToDelete = await Project.findById(id);

    if (!projectToDelete) {
      return res.status(404).json({ message: "Project not found" }); // Handle project not found
    }

    await projectToDelete.remove(); // Delete the project from the database
    res.status(204).send(); // No content response to indicate successful deletion
  } catch (err) {
    res.status(400).json({ message: err.message }); // Error handling
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
