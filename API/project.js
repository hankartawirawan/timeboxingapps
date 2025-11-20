let projects = [];  // Temporary in-memory storage (simulating database)

module.exports = async (req, res) => {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Get all projects
      res.status(200).json(projects);
      break;

    case 'POST':
      // Add a new project
      const { name, size } = req.body;
      const timeLimits = { small: 7, medium: 14, large: 28 };
      const timeLimit = timeLimits[size];

      // Create new project
      const newProject = {
        id: projects.length + 1,  // Simulate unique ID
        name,
        size,
        timeLimit,
        timeSpent: 0,
      };

      projects.push(newProject);
      res.status(201).json(newProject);
      break;

    case 'PUT':
      // Update project time spent
      const { id, timeSpent } = req.body;
      const projectToUpdate = projects.find((p) => p.id === id);

      if (!projectToUpdate) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // **VALIDASI**: Cek apakah timeSpent melebihi timeLimit
      if (timeSpent > projectToUpdate.timeLimit) {
        return res.status(400).json({ message: 'Time spent cannot exceed project time limit' });
      }

      // Update timeSpent
      projectToUpdate.timeSpent = timeSpent;
      res.status(200).json(projectToUpdate);
      break;

    case 'DELETE':
      // Delete project by ID
      const { deleteId } = req.query;
      projects = projects.filter((p) => p.id !== parseInt(deleteId));

      res.status(204).end();
      break;

    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
};
