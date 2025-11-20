let projects = []; // In-memory storage (simulasi database)

module.exports = async (req, res) => {
  const { method } = req;

  switch (method) {
    case "GET":
      // Mengambil semua proyek
      res.status(200).json(projects);
      break;
    case "POST":
      // Menambah proyek baru
      const { name, size } = req.body;
      const timeLimits = { small: 7, medium: 14, large: 28 };
      const timeLimit = timeLimits[size];

      const newProject = {
        id: projects.length + 1, // Simulasi ID
        name,
        size,
        timeLimit,
        timeSpent: 0,
      };

      projects.push(newProject); // Simpan ke dalam in-memory storage
      res.status(201).json(newProject);
      break;
    case "PUT":
      // Update proyek berdasarkan ID
      const { id, timeSpent } = req.body;
      const projectToUpdate = projects.find((p) => p.id === id);

      if (!projectToUpdate) {
        return res.status(404).json({ message: "Project not found" });
      }

      projectToUpdate.timeSpent = timeSpent;
      res.status(200).json(projectToUpdate);
      break;
    case "DELETE":
      // Hapus proyek berdasarkan ID
      const { deleteId } = req.query;
      projects = projects.filter((p) => p.id !== parseInt(deleteId));

      res.status(204).end();
      break;
    default:
      res.status(405).json({ message: "Method not allowed" });
  }
};
