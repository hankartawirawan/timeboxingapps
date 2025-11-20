const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = 5000; // Port untuk backend server

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Koneksi ke MongoDB (Ganti dengan URL MongoDB yang sesuai)
mongoose
  .connect("mongodb://localhost:27017/timebound", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// Schema untuk proyek
const projectSchema = new mongoose.Schema({
  name: String,
  size: { type: String, enum: ["small", "medium", "large"] },
  timeLimit: Number,
  timeSpent: { type: Number, default: 0 },
});

const Project = mongoose.model("Project", projectSchema);

// API Routes

// Get all projects
app.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new project
app.post("/projects", async (req, res) => {
  const { name, size } = req.body;
  const timeLimits = { small: 7, medium: 14, large: 28 };
  const timeLimit = timeLimits[size];

  const project = new Project({
    name,
    size,
    timeLimit,
  });

  try {
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update project time spent
app.put("/projects/:id", async (req, res) => {
  const { id } = req.params;
  const { timeSpent } = req.body;

  try {
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { timeSpent },
      { new: true }
    );
    res.status(200).json(updatedProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a project
app.delete("/projects/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Project.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
